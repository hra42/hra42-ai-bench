<script lang="ts">
	import { benchmarkConfig, currentRun, modelResponses, isRunning } from '$lib/stores/benchmark';
	import { selectedModels, availableModels } from '$lib/stores/models';
	import Button from '$lib/components/atoms/Button.svelte';
	import Card from '$lib/components/atoms/Card.svelte';
	import Input from '$lib/components/atoms/Input.svelte';
	import TextArea from '$lib/components/atoms/TextArea.svelte';
	import type { BenchmarkConfig } from '$lib/types/benchmark';

	let localConfig: BenchmarkConfig = {
		type: 'text',
		name: '',
		userPrompt: '',
		systemPrompt: '',
		maxTokens: 1000,
		temperature: 0.7
	};

	$: benchmarkConfig.set(localConfig);

	async function startBenchmark() {
		if ($selectedModels.length === 0) {
			alert('Please select at least one model');
			return;
		}

		if (!localConfig.userPrompt.trim()) {
			alert('Please enter a prompt');
			return;
		}

		isRunning.set(true);
		modelResponses.set([]);

		try {
			// Use streaming endpoint for real-time updates
			const response = await fetch('/api/execute/stream', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					config: localConfig,
					modelIds: $selectedModels
				})
			});

			if (!response.ok) {
				throw new Error('Failed to start benchmark');
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error('No response stream available');
			}

			let buffer = '';
			let currentEvent: string | null = null;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.startsWith('event: ')) {
						currentEvent = line.slice(7).trim();
					} else if (line.startsWith('data: ') && currentEvent) {
						try {
							const data = JSON.parse(line.slice(6));
							handleStreamEvent(currentEvent, data);
						} catch {
							// Failed to parse SSE data
						}
						currentEvent = null;
					}
				}
			}
		} catch {
			alert('Failed to run benchmark');
		} finally {
			isRunning.set(false);
		}
	}

	function handleStreamEvent(event: string, data: unknown) {
		switch (event) {
			case 'run_started':
				currentRun.set({
					id: data.runId,
					name: localConfig.name || 'Untitled Benchmark',
					benchmarkType: localConfig.type,
					status: 'running',
					totalModels: data.totalModels,
					completedModels: 0,
					userPrompt: localConfig.userPrompt,
					totalCost: 0,
					createdAt: new Date()
				});
				break;

			case 'model_started':
				modelResponses.update((responses) => [
					...responses,
					{
						id: data.responseId,
						runId: $currentRun?.id || '',
						modelId: data.modelId,
						modelName: $availableModels.find((m) => m.id === data.modelId)?.name,
						status: 'running'
					}
				]);
				break;

			case 'first_token':
				modelResponses.update((responses) =>
					responses.map((r) =>
						r.id === data.responseId ? { ...r, timeToFirstTokenMs: data.timeToFirstToken } : r
					)
				);
				break;

			case 'token':
				modelResponses.update((responses) =>
					responses.map((r) =>
						r.id === data.responseId
							? { ...r, responseText: (r.responseText || '') + data.content }
							: r
					)
				);
				break;

			case 'model_completed':
				modelResponses.update((responses) =>
					responses.map((r) =>
						r.id === data.responseId
							? {
									...r,
									status: 'completed',
									responseText: data.response,
									// Don't overwrite these if they were already set by cost_update
									promptTokens: r.promptTokens || data.usage?.prompt_tokens,
									completionTokens: r.completionTokens || data.usage?.completion_tokens,
									totalTokens: r.totalTokens || data.usage?.total_tokens,
									cost: r.cost || data.cost, // Keep existing cost if already set
									latencyMs: data.latencyMs,
									openRouterLatencyMs: data.openRouterLatencyMs,
									timeToFirstTokenMs: r.timeToFirstTokenMs, // Preserve TTFT
									tokensPerSecond: r.tokensPerSecond // Preserve tokens/sec
								}
							: r
					)
				);
				break;

			case 'model_error':
				modelResponses.update((responses) =>
					responses.map((r) =>
						r.id === data.responseId
							? {
									...r,
									status: 'error',
									errorMessage: data.error
								}
							: r
					)
				);
				break;

			case 'progress':
				if ($currentRun) {
					currentRun.update((run) => ({
						...run!,
						completedModels: data.completedModels,
						totalCost: data.totalCost
					}));
				}
				break;

			case 'cost_update':
				// Update cost and metrics when they arrive in the stream
				modelResponses.update((responses) =>
					responses.map((r) =>
						r.id === data.responseId
							? {
									...r,
									cost: data.cost,
									tokensPerSecond: data.tokensPerSecond,
									promptTokens: data.usage?.prompt_tokens,
									completionTokens: data.usage?.completion_tokens,
									totalTokens: data.usage?.total_tokens
								}
							: r
					)
				);
				// Update total cost
				if ($currentRun) {
					const newTotalCost =
						$modelResponses.reduce((sum, r) => sum + (r.cost || 0), 0) + (data.cost || 0);
					currentRun.update((run) => ({
						...run!,
						totalCost: newTotalCost
					}));
				}
				break;

			case 'latency_update':
				// Update OpenRouter latency when it arrives asynchronously
				modelResponses.update((responses) =>
					responses.map((r) =>
						r.id === data.responseId
							? {
									...r,
									openRouterLatencyMs: data.openRouterLatencyMs
								}
							: r
					)
				);
				break;

			case 'metrics_update':
				// Update all metrics when they arrive from OpenRouter generation endpoint
				modelResponses.update((responses) =>
					responses.map((r) =>
						r.id === data.responseId
							? {
									...r,
									openRouterLatencyMs: data.openRouterLatencyMs,
									generationTimeMs: data.generationTimeMs,
									moderationLatencyMs: data.moderationLatencyMs,
									timeToFirstTokenMs: data.timeToFirstTokenMs
								}
							: r
					)
				);
				break;

			case 'run_completed':
				if ($currentRun) {
					currentRun.update((run) => ({
						...run!,
						status: 'completed',
						completedAt: new Date()
					}));
				}
				break;
		}
	}

	function stopBenchmark() {
		// In a real implementation, we'd need to track and abort the fetch
		isRunning.set(false);
	}
</script>

<Card class="p-6">
	<div class="space-y-4">
		<h3 class="text-lg font-semibold text-slate-900">Configure Benchmark</h3>

		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-slate-700">
					Benchmark Name
				</label>
				<Input
					id="name"
					type="text"
					placeholder="Enter benchmark name"
					bind:value={localConfig.name}
					disabled={$isRunning}
				/>
			</div>

			<div>
				<label for="type" class="mb-1 block text-sm font-medium text-slate-700">
					Benchmark Type
				</label>
				<select
					id="type"
					bind:value={localConfig.type}
					disabled={$isRunning}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					<option value="text">Text Generation</option>
					<option value="structured" disabled>Structured Output (Coming Soon)</option>
					<option value="tool" disabled>Tool/Function Calling (Coming Soon)</option>
					<option value="vision" disabled>Vision Analysis (Coming Soon)</option>
					<option value="document" disabled>Document Processing (Coming Soon)</option>
				</select>
			</div>
		</div>

		<div>
			<label for="system" class="mb-1 block text-sm font-medium text-slate-700">
				System Prompt (Optional)
			</label>
			<TextArea
				id="system"
				placeholder="Enter system prompt..."
				bind:value={localConfig.systemPrompt}
				disabled={$isRunning}
				rows={3}
			/>
		</div>

		<div>
			<label for="user" class="mb-1 block text-sm font-medium text-slate-700"> User Prompt </label>
			<TextArea
				id="user"
				placeholder="Enter your prompt..."
				bind:value={localConfig.userPrompt}
				disabled={$isRunning}
				rows={5}
			/>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="tokens" class="mb-1 block text-sm font-medium text-slate-700">
					Max Tokens
				</label>
				<Input
					id="tokens"
					type="number"
					min="1"
					max="4096"
					bind:value={localConfig.maxTokens}
					disabled={$isRunning}
				/>
			</div>

			<div>
				<label for="temp" class="mb-1 block text-sm font-medium text-slate-700">
					Temperature
				</label>
				<Input
					id="temp"
					type="number"
					min="0"
					max="2"
					step="0.1"
					bind:value={localConfig.temperature}
					disabled={$isRunning}
				/>
			</div>
		</div>

		<div class="flex items-center justify-between border-t pt-4">
			<div class="text-sm text-slate-600">
				{$selectedModels.length} model{$selectedModels.length !== 1 ? 's' : ''} selected
			</div>

			<div class="flex gap-2">
				{#if $isRunning}
					<Button variant="secondary" on:click={stopBenchmark}>Stop Benchmark</Button>
				{:else}
					<Button
						variant="primary"
						on:click={startBenchmark}
						disabled={$selectedModels.length === 0 || !localConfig.userPrompt.trim()}
					>
						Start Benchmark
					</Button>
				{/if}
			</div>
		</div>
	</div>
</Card>
