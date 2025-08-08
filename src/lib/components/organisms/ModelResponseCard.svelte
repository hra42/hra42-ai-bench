<script lang="ts">
	import Card from '../atoms/Card.svelte';
	import Button from '../atoms/Button.svelte';
	import CostDisplay from '../molecules/CostDisplay.svelte';
	import ResponseTime from '../molecules/ResponseTime.svelte';
	import TokenCounter from '../molecules/TokenCounter.svelte';
	import StatusIndicator from '../molecules/StatusIndicator.svelte';
	import ResponseViewer from './ResponseViewer.svelte';

	export let modelName: string;
	export let provider: string;
	export let status: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
	export let response = '';
	export let error = '';
	export let duration: number | undefined = undefined;
	export let cost: number | undefined = undefined;
	export let inputTokens: number | undefined = undefined;
	export let outputTokens: number | undefined = undefined;
	export let maxTokens: number | undefined = undefined;
	export let responseFormat: 'text' | 'json' | 'markdown' | 'code' = 'text';
	export let expanded = false;

	function toggleExpanded() {
		expanded = !expanded;
	}
</script>

<Card>
	<div class="space-y-4">
		<div class="flex items-start justify-between gap-2">
			<div class="flex min-w-0 flex-1 items-center gap-3">
				<div class="min-w-0 flex-1">
					<h3
						class="truncate text-lg font-semibold text-slate-900 dark:text-white"
						title={modelName}
					>
						{modelName}
					</h3>
					<p class="text-sm text-slate-500 dark:text-slate-400">{provider}</p>
				</div>
				<div class="flex-shrink-0">
					<StatusIndicator {status} animated={status === 'running'} />
				</div>
			</div>

			<div class="flex-shrink-0">
				<Button variant="ghost" size="sm" on:click={toggleExpanded}>
					{expanded ? 'Collapse' : 'Expand'}
				</Button>
			</div>
		</div>

		{#if status === 'completed' && response}
			{#if !expanded}
				<div class="relative max-h-32 overflow-hidden rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
					<pre
						class="font-mono text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">{response.slice(
							0,
							200
						)}{response.length > 200 ? '...' : ''}</pre>
					{#if response.length > 200}
						<div
							class="absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-800"
						/>
					{/if}
				</div>
			{:else}
				<ResponseViewer content={response} format={responseFormat} maxHeight="600px" />
			{/if}

			<div
				class="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 md:grid-cols-4 dark:border-slate-700"
			>
				{#if duration !== undefined}
					<div>
						<p class="mb-1 text-xs text-slate-500 dark:text-slate-400">Response Time</p>
						<ResponseTime {duration} />
					</div>
				{/if}

				{#if cost !== undefined}
					<div>
						<p class="mb-1 text-xs text-slate-500 dark:text-slate-400">Cost</p>
						<CostDisplay {cost} />
					</div>
				{/if}

				{#if inputTokens !== undefined}
					<div>
						<p class="mb-1 text-xs text-slate-500 dark:text-slate-400">Input Tokens</p>
						<p class="font-mono text-sm text-slate-900 dark:text-white">
							{inputTokens.toLocaleString()}
						</p>
					</div>
				{/if}

				{#if outputTokens !== undefined}
					<div>
						<p class="mb-1 text-xs text-slate-500 dark:text-slate-400">Output Tokens</p>
						<p class="font-mono text-sm text-slate-900 dark:text-white">
							{outputTokens.toLocaleString()}
						</p>
					</div>
				{/if}
			</div>

			{#if inputTokens !== undefined && outputTokens !== undefined}
				<div class="pt-2">
					<TokenCounter {inputTokens} {outputTokens} {maxTokens} />
				</div>
			{/if}
		{:else if status === 'failed' && error}
			<div
				class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
			>
				<div class="flex items-start gap-3">
					<svg
						class="mt-0.5 h-5 w-5 text-red-500 dark:text-red-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<div>
						<p class="font-medium text-red-900 dark:text-red-300">Error occurred</p>
						<p class="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
					</div>
				</div>
			</div>
		{:else if status === 'running'}
			<div class="flex flex-col items-center justify-center py-12">
				<svg class="h-10 w-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<p class="mt-3 text-sm text-slate-500 dark:text-slate-400">Processing request...</p>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-12">
				<svg class="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p class="mt-3 text-sm text-slate-400 dark:text-slate-500">Waiting to start...</p>
			</div>
		{/if}
	</div>
</Card>
