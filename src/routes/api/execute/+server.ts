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
        max_tokens, temperature, started_at
      ) VALUES (?, ?, ?, ?, 'running', ?, 0, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
				config.temperature || 0.7
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
	client: any,
	db: any
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
			const messages: any[] = [];
			if (config.systemPrompt) {
				messages.push({ role: 'system', content: config.systemPrompt });
			}
			messages.push({ role: 'user', content: config.userPrompt });

			// Make API call with usage accounting
			const response = await client.chat({
				model: modelId,
				messages,
				max_tokens: config.maxTokens || 1000,
				temperature: config.temperature || 0.7,
				stream: false,
				usage: {
					include: true  // Request usage information from OpenRouter
				}
			});

			const latencyMs = Date.now() - startTime;

			// OpenRouter returns the cost directly in the response
			const cost = response.usage?.cost || 0;
			totalCost += cost;

			// Update response in database
			await db.run(
				`
        UPDATE model_responses 
        SET 
          status = 'completed',
          response_text = ?,
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
					response.choices?.[0]?.message?.content || '',
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
