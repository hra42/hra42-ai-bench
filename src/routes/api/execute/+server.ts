import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOpenRouterClient } from '$lib/server/openrouter/client';
import { SimplifiedDBClient } from '$lib/server/db/client';
import type { BenchmarkConfig } from '$lib/types/benchmark';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { config, modelIds }: { config: BenchmarkConfig; modelIds: string[] } =
			await request.json();

		if (!config || !modelIds || modelIds.length === 0) {
			return json({ error: 'Invalid request' }, { status: 400 });
		}

		const db = new SimplifiedDBClient();
		const client = getOpenRouterClient();

		// Create benchmark run
		const runId = crypto.randomUUID();
		await db.run(
			`
      INSERT INTO benchmark_runs (
        id, name, description, benchmark_type, status,
        total_models, completed_models, system_prompt, user_prompt,
        max_tokens, temperature, json_schema, tool_definitions, started_at
      ) VALUES (?, ?, ?, ?, 'running', ?, 0, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
			[
				runId,
				config.name || 'Untitled Benchmark',
				config.description || null,
				config.type,
				modelIds.length,
				config.systemPrompt || null,
				config.userPrompt,
				config.maxTokens || 1000,
				config.temperature || 0.7,
				config.type === 'structured' && config.jsonSchema
					? typeof config.jsonSchema === 'string'
						? config.jsonSchema
						: JSON.stringify(config.jsonSchema)
					: null,
				config.type === 'tool' && config.toolDefinitions
					? typeof config.toolDefinitions === 'string'
						? config.toolDefinitions
						: JSON.stringify(config.toolDefinitions)
					: null
			]
		);

		// Create response entries for each model
		const responseIds: Record<string, string> = {};
		for (const modelId of modelIds) {
			const responseId = crypto.randomUUID();
			responseIds[modelId] = responseId;

			await db.run(
				`
        INSERT INTO model_responses (
          id, run_id, model_id, status, started_at
        ) VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)
      `,
				[responseId, runId, modelId]
			);
		}

		// Start processing models sequentially
		processModels(runId, config, modelIds, responseIds, client, db);

		return json({
			runId,
			message: 'Benchmark started',
			responseIds
		});
	} catch (error) {
		console.error('Error starting benchmark:', error);
		return json({ error: 'Failed to start benchmark' }, { status: 500 });
	}
};

async function processModels(
	runId: string,
	config: BenchmarkConfig,
	modelIds: string[],
	responseIds: Record<string, string>,
	client: ReturnType<typeof getOpenRouterClient>,
	db: SimplifiedDBClient
) {
	let completedCount = 0;
	let totalCost = 0;

	for (const modelId of modelIds) {
		const responseId = responseIds[modelId];

		try {
			// Update status to running
			await db.run(
				`
        UPDATE model_responses 
        SET status = 'running', started_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
				[responseId]
			);

			const startTime = Date.now();

			// Prepare messages
			const messages: Array<{ role: string; content: string }> = [];
			if (config.systemPrompt) {
				messages.push({ role: 'system', content: config.systemPrompt });
			}
			messages.push({ role: 'user', content: config.userPrompt });

			// Prepare request with structured output support
			const chatRequest: any = {
				model: modelId,
				messages,
				max_tokens: config.maxTokens || 1000,
				temperature: config.temperature || 0.7,
				stream: false,
				usage: {
					include: true // Request usage information from OpenRouter
				}
			};

			// Add structured output formatting if applicable
			if (config.type === 'structured' && config.jsonSchema) {
				try {
					const schema =
						typeof config.jsonSchema === 'string'
							? JSON.parse(config.jsonSchema)
							: config.jsonSchema;

					chatRequest.response_format = {
						type: 'json_schema',
						json_schema: {
							name: 'structured_output',
							strict: true,
							schema: schema
						}
					};
				} catch (e) {
					console.error('Invalid JSON schema:', e);
				}
			}

			// Add tool definitions for function calling
			if (config.type === 'tool' && config.toolDefinitions) {
				try {
					const tools =
						typeof config.toolDefinitions === 'string'
							? JSON.parse(config.toolDefinitions)
							: config.toolDefinitions;

					// Ensure tools are in the correct format
					chatRequest.tools = Array.isArray(tools) ? tools : [tools];
					// Let the model decide when to use tools
					chatRequest.tool_choice = 'auto';
				} catch (e) {
					console.error('Invalid tool definitions:', e);
				}
			}

			// Make API call with usage accounting
			const response = await client.chat(chatRequest);

			const latencyMs = Date.now() - startTime;

			// OpenRouter returns the cost directly in the response
			const cost = response.usage?.cost || 0;
			totalCost += cost;

			// Extract response content and tool calls
			const message = response.choices?.[0]?.message;
			const messageContent = message?.content;
			let responseContent =
				typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent) || '';

			// Handle tool calls for function calling benchmarks
			let toolCallsJson = null;
			if (config.type === 'tool' && message?.tool_calls) {
				toolCallsJson = JSON.stringify(message.tool_calls);
				// If there are tool calls but no content, create a summary
				if (!responseContent || responseContent.trim() === '') {
					const toolNames = message.tool_calls.map((tc: any) => tc.function?.name).join(', ');
					responseContent = `Model requested tool calls: ${toolNames}`;
				}
			}

			// Check if response is empty
			if (!responseContent || responseContent.trim() === '') {
				console.warn(`Model ${modelId} returned empty response`);
				// Store a message about empty response
				if (config.type === 'structured') {
					responseContent =
						'{"error": "Model returned empty response - may not support structured outputs"}';
				} else if (config.type === 'tool') {
					responseContent = 'Model returned empty response - may not support function calling';
				}
			}

			// For structured outputs, also store the JSON separately if it's valid
			let responseJson = null;
			if (config.type === 'structured' && responseContent) {
				try {
					// Validate that the response is valid JSON
					const parsed = JSON.parse(responseContent);
					responseJson = JSON.stringify(parsed);
				} catch (e) {
					console.error('Response is not valid JSON:', e);
				}
			}

			// Update response in database
			await db.run(
				`
        UPDATE model_responses 
        SET 
          status = 'completed',
          response_text = ?,
          response_json = ?,
          tool_calls = ?,
          prompt_tokens = ?,
          completion_tokens = ?,
          total_tokens = ?,
          cost = ?,
          latency_ms = ?,
          tokens_per_second = ?,
          completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
				[
					responseContent,
					responseJson,
					toolCallsJson,
					response.usage?.prompt_tokens || 0,
					response.usage?.completion_tokens || 0,
					response.usage?.total_tokens || 0,
					cost,
					latencyMs,
					response.usage?.completion_tokens
						? response.usage.completion_tokens / (latencyMs / 1000)
						: 0,
					responseId
				]
			);

			completedCount++;
		} catch (error) {
			console.error(`Error processing model ${modelId}:`, error);

			// Update response with error
			await db.run(
				`
        UPDATE model_responses 
        SET 
          status = 'error',
          error_message = ?,
          completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
				[error instanceof Error ? error.message : 'Unknown error', responseId]
			);

			completedCount++;
		}

		// Update benchmark run progress
		await db.run(
			`
      UPDATE benchmark_runs 
      SET 
        completed_models = ?,
        total_cost = ?
      WHERE id = ?
    `,
			[completedCount, totalCost, runId]
		);
	}

	// Mark benchmark as completed
	await db.run(
		`
    UPDATE benchmark_runs 
    SET 
      status = 'completed',
      completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
		[runId]
	);
}
