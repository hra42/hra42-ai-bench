import type { RequestHandler } from './$types';
import { getOpenRouterClient } from '$lib/server/openrouter/client';
import { SimplifiedDBClient } from '$lib/server/db/client';
import type { BenchmarkConfig } from '$lib/types/benchmark';

export const POST: RequestHandler = async ({ request }) => {
	const { config, modelIds }: { config: BenchmarkConfig; modelIds: string[] } =
		await request.json();

	if (!config || !modelIds || modelIds.length === 0) {
		return new Response('Invalid request', { status: 400 });
	}

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();
			const db = new SimplifiedDBClient();
			const client = getOpenRouterClient();

			// Helper to send SSE messages
			let streamClosed = false;
			const sendMessage = (event: string, data: any) => {
				if (!streamClosed) {
					try {
						controller.enqueue(
							encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
						);
					} catch (err) {
						// Stream is closed, ignore
						streamClosed = true;
					}
				}
			};

			try {
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

				sendMessage('run_started', { runId, totalModels: modelIds.length });

				// Process each model
				let completedCount = 0;
				let totalCost = 0;

				for (const modelId of modelIds) {
					const responseId = crypto.randomUUID();

					// Create response entry
					await db.run(
						`
            INSERT INTO model_responses (
              id, run_id, model_id, status, started_at
            ) VALUES (?, ?, ?, 'running', CURRENT_TIMESTAMP)
          `,
						[responseId, runId, modelId]
					);

					sendMessage('model_started', { modelId, responseId });

					try {
						const startTime = Date.now();

						// Prepare messages
						const messages: any[] = [];
						if (config.systemPrompt) {
							messages.push({ role: 'system', content: config.systemPrompt });
						}
						messages.push({ role: 'user', content: config.userPrompt });

						// Stream the response
						const streamResponse = await client.chatStream({
							model: modelId,
							messages,
							max_tokens: config.maxTokens || 1000,
							temperature: config.temperature || 0.7
						});

						let fullResponse = '';
						let firstTokenTime: number | null = null;
						let generationId: string | null = null;
						const reader = streamResponse.getReader();
						const decoder = new TextDecoder();

						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							const chunk = decoder.decode(value);
							const lines = chunk.split('\n');

							for (const line of lines) {
								if (line.startsWith('data: ')) {
									const data = line.slice(6);
									if (data === '[DONE]') {
										continue;
									}

									try {
										const parsed = JSON.parse(data);

										// Capture generation ID from the first chunk
										if (!generationId && parsed.id) {
											generationId = parsed.id;
										}

										const content = parsed.choices?.[0]?.delta?.content;

										if (content) {
											if (firstTokenTime === null) {
												firstTokenTime = Date.now();
												sendMessage('first_token', {
													modelId,
													responseId,
													timeToFirstToken: firstTokenTime - startTime
												});
											}

											fullResponse += content;
											sendMessage('token', { modelId, responseId, content });
										}

										// Check for usage data in the stream (OpenRouter sends it at the end)
										if (parsed.usage) {
											const currentTime = Date.now() - startTime;
											// Calculate actual cost from usage data
											// Handle scientific notation and ensure it's a valid number
											const actualCost = typeof parsed.usage.cost === 'number' && !isNaN(parsed.usage.cost) 
												? parsed.usage.cost 
												: 0;
											totalCost += actualCost;

											// Update database with usage and cost
											const tokensPerSecond =
												parsed.usage.completion_tokens && currentTime > 0
													? parsed.usage.completion_tokens / (currentTime / 1000)
													: 0;

											await db.run(
												`
                        UPDATE model_responses 
                        SET 
                          prompt_tokens = ?,
                          completion_tokens = ?,
                          total_tokens = ?,
                          cost = ?,
                          tokens_per_second = ?
                        WHERE id = ?
                      `,
												[
													parsed.usage.prompt_tokens || 0,
													parsed.usage.completion_tokens || 0,
													parsed.usage.total_tokens ||
														parsed.usage.prompt_tokens + parsed.usage.completion_tokens ||
														0,
													actualCost,
													tokensPerSecond,
													responseId
												]
											);

											// Send immediate cost update
											sendMessage('cost_update', {
												modelId,
												responseId,
												cost: actualCost,
												tokensPerSecond,
												usage: {
													prompt_tokens: parsed.usage.prompt_tokens,
													completion_tokens: parsed.usage.completion_tokens,
													total_tokens:
														parsed.usage.total_tokens ||
														parsed.usage.prompt_tokens + parsed.usage.completion_tokens
												}
											});
										}
									} catch (e) {
										// Ignore parsing errors
									}
								}
							}
						}

						// After streaming completes
						const latencyMs = Date.now() - startTime;

						// Mark as completed
						await db.run(
							`
              UPDATE model_responses 
              SET 
                status = 'completed',
                response_text = ?,
                latency_ms = ?,
                time_to_first_token_ms = ?,
                completed_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `,
							[
								fullResponse,
								latencyMs,
								firstTokenTime ? firstTokenTime - startTime : null,
								responseId
							]
						);

						sendMessage('model_completed', {
							modelId,
							responseId,
							response: fullResponse,
							latencyMs,
							generationId
						});

						// If we have a generation ID, fetch additional details (like OpenRouter latency)
						if (generationId) {
							// Try to fetch OpenRouter latency from generation endpoint
							// Cost and usage are already handled via the stream
							let retries = 0;
							const maxRetries = 3;
							const baseDelay = 2000; // Start with 2 seconds

							while (retries < maxRetries) {
								try {
									// Wait before fetching (OpenRouter needs time to process)
									await new Promise((resolve) => setTimeout(resolve, baseDelay * (retries + 1)));
									const generation = await client.getGeneration(generationId);

									if (generation && generation.latency !== undefined) {
										// Update with OpenRouter's reported latency
										const openRouterLatencyMs = generation.latency;

										await db.run(
											`
                      UPDATE model_responses 
                      SET 
                        openrouter_latency_ms = ?
                      WHERE id = ?
                    `,
											[openRouterLatencyMs, responseId]
										);

										// Send latency update
										sendMessage('latency_update', {
											modelId,
											responseId,
											openRouterLatencyMs
										});

										break; // Exit the loop
									}
								} catch (err) {
									// Retry silently
								}
								retries++;
							}
						} else {
							// No generation ID, just mark as completed
							await db.run(
								`
                UPDATE model_responses 
                SET 
                  status = 'completed',
                  response_text = ?,
                  latency_ms = ?,
                  time_to_first_token_ms = ?,
                  completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `,
								[
									fullResponse,
									latencyMs,
									firstTokenTime ? firstTokenTime - startTime : null,
									responseId
								]
							);

							sendMessage('model_completed', {
								modelId,
								responseId,
								response: fullResponse,
								cost: 0,
								latencyMs
							});
						}

						completedCount++;
					} catch (error) {
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

						sendMessage('model_error', {
							modelId,
							responseId,
							error: error instanceof Error ? error.message : 'Unknown error'
						});

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

					sendMessage('progress', {
						completedModels: completedCount,
						totalModels: modelIds.length,
						totalCost
					});
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

				sendMessage('run_completed', { runId, totalCost, completedModels: completedCount });
			} catch (error) {
				sendMessage('error', {
					error: error instanceof Error ? error.message : 'Unknown error'
				});
			} finally {
				streamClosed = true;
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
