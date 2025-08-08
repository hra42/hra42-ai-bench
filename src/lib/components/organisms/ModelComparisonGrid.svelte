<script lang="ts">
	import Card from '../atoms/Card.svelte';
	import CostDisplay from '../molecules/CostDisplay.svelte';
	import TokenCounter from '../molecules/TokenCounter.svelte';
	import StatusIndicator from '../molecules/StatusIndicator.svelte';

	export let responses: Array<{
		modelId: string;
		modelName: string;
		provider: string;
		status: 'pending' | 'running' | 'completed' | 'failed';
		response?: string;
		error?: string;
		duration?: number;
		openRouterLatencyMs?: number;
		generationTimeMs?: number;
		moderationLatencyMs?: number;
		timeToFirstTokenMs?: number;
		cost?: number;
		inputTokens?: number;
		outputTokens?: number;
		maxTokens?: number;
		tokensPerSecond?: number;
	}> = [];

	export let columns: 'auto' | 1 | 2 | 3 | 4 = 'auto';

	$: gridClass = columns === 'auto' ? 'grid-cols-1 lg:grid-cols-2' : `grid-cols-${columns}`;
</script>

<div class="grid {gridClass} gap-6">
	{#each responses as response (response.modelId)}
		<Card>
			<div class="space-y-4">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0 flex-1">
						<h4
							class="truncate font-semibold text-slate-900 dark:text-white"
							title={response.modelName}
						>
							{response.modelName}
						</h4>
						<p class="text-sm text-slate-500 dark:text-slate-400">{response.provider}</p>
					</div>
					<div class="flex-shrink-0">
						<StatusIndicator
							status={response.status}
							size="sm"
							animated={response.status === 'running'}
						/>
					</div>
				</div>

				{#if (response.status === 'completed' || response.status === 'running') && response.response}
					<div class="prose prose-sm max-w-none">
						<div class="max-h-96 overflow-y-auto rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
							<pre
								class="font-mono text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300">{response.response}{#if response.status === 'running'}<span
										class="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-slate-600 dark:bg-slate-400"
									/>{/if}</pre>
						</div>
					</div>

					<div class="space-y-2 border-t border-slate-200 pt-2 dark:border-slate-700">
						<!-- Metrics Row -->
						<div class="flex flex-wrap gap-2 text-xs">
							{#if response.duration !== undefined}
								<span class="text-slate-600 dark:text-slate-400" title="End-to-end latency">
									Total: <span class="font-medium text-slate-900 dark:text-white"
										>{response.duration}ms</span
									>
								</span>
							{/if}

							{#if response.openRouterLatencyMs !== undefined}
								<span class="text-blue-600 dark:text-blue-400" title="OpenRouter reported latency">
									OR: <span class="font-medium">{response.openRouterLatencyMs}ms</span>
								</span>
							{/if}

							{#if response.generationTimeMs !== undefined}
								<span class="text-green-600 dark:text-green-400" title="Model generation time">
									Gen: <span class="font-medium">{response.generationTimeMs}ms</span>
								</span>
							{/if}

							{#if response.moderationLatencyMs !== undefined}
								<span class="text-amber-600 dark:text-amber-400" title="Moderation latency">
									Mod: <span class="font-medium">{response.moderationLatencyMs}ms</span>
								</span>
							{/if}

							{#if response.timeToFirstTokenMs !== undefined}
								<span class="text-purple-600 dark:text-purple-400" title="Time to first token">
									TTFT: <span class="font-medium">{response.timeToFirstTokenMs}ms</span>
								</span>
							{/if}

							{#if response.tokensPerSecond !== undefined}
								<span class="text-slate-600 dark:text-slate-400" title="Tokens per second">
									<span class="font-medium">{response.tokensPerSecond.toFixed(1)}</span> tok/s
								</span>
							{/if}
						</div>

						{#if response.cost !== undefined}
							<div class="flex items-center justify-between">
								<span class="text-sm text-slate-600 dark:text-slate-400">Cost</span>
								<CostDisplay cost={response.cost} size="sm" />
							</div>
						{/if}

						{#if response.inputTokens !== undefined && response.outputTokens !== undefined}
							<div class="pt-2">
								<TokenCounter
									inputTokens={response.inputTokens}
									outputTokens={response.outputTokens}
									maxTokens={response.maxTokens}
									showBar={false}
								/>
							</div>
						{/if}
					</div>
				{:else if response.status === 'failed' && response.error}
					<div
						class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
					>
						<p class="text-sm text-red-700 dark:text-red-400">{response.error}</p>
					</div>
				{:else if response.status === 'running' && !response.response}
					<div class="flex items-center justify-center py-8">
						<div class="text-center">
							<svg
								class="mx-auto h-8 w-8 animate-spin text-blue-500"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Generating response...</p>
						</div>
					</div>
				{:else}
					<div class="flex items-center justify-center py-8">
						<p class="text-sm text-slate-400 dark:text-slate-500">Waiting to start...</p>
					</div>
				{/if}
			</div>
		</Card>
	{/each}
</div>
