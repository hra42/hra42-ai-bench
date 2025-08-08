<script lang="ts">
	import BenchmarkingInterface from '$lib/components/templates/BenchmarkingInterface.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// Transform models data for the interface
	$: availableModels = data.models?.map((m) => ({
		id: m.id,
		name: m.name,
		provider: m.id.split('/')[0] || 'Unknown',
		pricingPrompt: m.pricingPrompt,
		pricingCompletion: m.pricingCompletion
	})) || [];

	let selectedModels: string[] = [];
	let benchmarkName = '';
	let benchmarkType: 'text' | 'structured' | 'tool' | 'vision' | 'document' = 'text';
	let systemPrompt = '';
	let prompt = '';
	let temperature = 0.7;
	let maxTokens = 2048;
	let files: File[] = [];
	let jsonSchema = '';
	let functionDefinitions = '';
	let responses: Array<{
		modelId: string;
		modelName: string;
		provider: string;
		status: 'pending' | 'running' | 'completed' | 'failed';
		response?: string;
		responseId?: string;
		error?: string;
		duration?: number;
		cost?: number;
		inputTokens?: number;
		outputTokens?: number;
	}> = [];
	let costBreakdown: Array<{
		name: string;
		inputCost: number;
		outputCost: number;
		totalCost: number;
		inputTokens: number;
		outputTokens: number;
	}> = [];
	let isRunning = false;

	function handleStreamEvent(eventType: string, data: Record<string, unknown>) {
		switch (eventType) {
			case 'run_started':
				break;

			case 'model_started':
				responses = responses.map((r) =>
					r.modelId === data.modelId ? { ...r, status: 'running', responseId: data.responseId } : r
				);
				break;

			case 'token':
				responses = responses.map((r) =>
					r.responseId === data.responseId
						? { ...r, response: (r.response || '') + data.content }
						: r
				);
				break;

			case 'first_token':
				responses = responses.map((r) =>
					r.responseId === data.responseId ? { ...r, timeToFirstToken: data.timeToFirstToken } : r
				);
				break;

			case 'cost_update':
				responses = responses.map((r) =>
					r.responseId === data.responseId
						? {
								...r,
								cost: data.cost,
								inputTokens: data.usage?.prompt_tokens || r.inputTokens,
								outputTokens: data.usage?.completion_tokens || r.outputTokens,
								tokensPerSecond: data.tokensPerSecond
							}
						: r
				);
				updateCostBreakdown();
				break;

			case 'model_completed':
				responses = responses.map((r) =>
					r.responseId === data.responseId
						? {
								...r,
								status: 'completed',
								response: data.response, // Changed from responseText to response
								duration: data.latencyMs,
								openRouterLatencyMs: data.openRouterLatencyMs,
								generationTimeMs: data.generationTimeMs,
								moderationLatencyMs: data.moderationLatencyMs,
								timeToFirstTokenMs: r.timeToFirstTokenMs,
								cost: r.cost || data.cost || 0
							}
						: r
				);
				updateCostBreakdown();
				break;

			case 'metrics_update':
				// Update all metrics when they arrive from OpenRouter generation endpoint
				responses = responses.map((r) =>
					r.responseId === data.responseId
						? {
								...r,
								openRouterLatencyMs: data.openRouterLatencyMs,
								generationTimeMs: data.generationTimeMs,
								moderationLatencyMs: data.moderationLatencyMs,
								timeToFirstTokenMs: data.timeToFirstTokenMs
							}
						: r
				);
				break;

			case 'model_error':
				responses = responses.map((r) =>
					r.responseId === data.responseId
						? {
								...r,
								status: 'failed',
								error: data.error
							}
						: r
				);
				break;

			case 'run_completed':
				isRunning = false;
				break;

			case 'error':
				console.error('Benchmark error:', data.error);
				isRunning = false;
				break;
		}
	}

	function updateCostBreakdown() {
		costBreakdown = responses
			.filter((r) => r.status === 'completed' || (r.status === 'running' && r.cost))
			.map((r) => {
				const model = availableModels.find((m) => m.id === r.modelId);
				const inputTokens = r.inputTokens || 0;
				const outputTokens = r.outputTokens || 0;

				let inputCost = 0;
				let outputCost = 0;
				let totalCost = typeof r.cost === 'number' && !isNaN(r.cost) ? r.cost : 0;

				if (
					model &&
					typeof model.pricingPrompt === 'number' &&
					!isNaN(model.pricingPrompt) &&
					typeof model.pricingCompletion === 'number' &&
					!isNaN(model.pricingCompletion)
				) {
					inputCost = inputTokens * model.pricingPrompt;
					outputCost = outputTokens * model.pricingCompletion;

					if (totalCost === 0 && (inputCost > 0 || outputCost > 0)) {
						totalCost = inputCost + outputCost;
					}
				} else if (totalCost > 0) {
					inputCost = totalCost * 0.3;
					outputCost = totalCost * 0.7;
				}

				return {
					name: r.modelName,
					inputCost: isNaN(inputCost) ? 0 : inputCost,
					outputCost: isNaN(outputCost) ? 0 : outputCost,
					totalCost: isNaN(totalCost) ? 0 : totalCost,
					inputTokens,
					outputTokens
				};
			});
	}

	async function handleExecute(event: CustomEvent) {
		const config = event.detail;
		isRunning = true;

		// Initialize response tracking
		responses = config.selectedModels.map((modelId: string) => {
			const model = availableModels.find((m) => m.id === modelId);
			return {
				modelId,
				modelName: model?.name || modelId,
				provider: model?.provider || 'Unknown',
				status: 'pending' as const,
				response: '', // Changed from responseText to response
				cost: 0,
				inputTokens: 0,
				outputTokens: 0
			};
		});

		try {
			// Use streaming endpoint for real-time updates
			const response = await fetch('/api/execute/stream', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					config: {
						name: config.benchmarkName || 'Untitled Benchmark',
						type: config.benchmarkType,
						systemPrompt: config.systemPrompt,
						userPrompt: config.prompt,
						maxTokens: config.maxTokens,
						temperature: config.temperature
					},
					modelIds: config.selectedModels
				})
			});

			if (!response.ok) {
				throw new Error('Failed to start benchmark');
			}

			// Read the streaming response
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error('No response body');
			}

			let buffer = '';
			let currentEventType = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.startsWith('event: ')) {
						currentEventType = line.slice(7);
						continue;
					}

					if (line.startsWith('data: ')) {
						try {
							const data = JSON.parse(line.slice(6));
							handleStreamEvent(currentEventType, data);
						} catch (err) {
							console.error('Error parsing SSE data:', err);
						}
					}
				}
			}
		} catch (error) {
			console.error('Error executing benchmark:', error);
			isRunning = false;
			responses = responses.map((r) => ({
				...r,
				status: r.status === 'running' ? 'failed' : r.status,
				error: r.status === 'running' ? 'Benchmark failed' : r.error
			}));
		}
	}

	function handleCancel() {
		isRunning = false;
		responses = responses.map((r) => ({
			...r,
			status: r.status === 'running' ? 'cancelled' : r.status
		}));
	}
</script>

<BenchmarkingInterface
	{availableModels}
	bind:selectedModels
	bind:benchmarkName
	bind:benchmarkType
	bind:systemPrompt
	bind:prompt
	bind:temperature
	bind:maxTokens
	bind:files
	bind:jsonSchema
	bind:functionDefinitions
	{responses}
	{costBreakdown}
	{isRunning}
	on:execute={handleExecute}
	on:cancel={handleCancel}
/>
