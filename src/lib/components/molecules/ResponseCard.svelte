<script lang="ts">
	import Card from '$lib/components/atoms/Card.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import Spinner from '$lib/components/atoms/Spinner.svelte';
	import type { ModelResponse } from '$lib/types/benchmark';
	import type { Model } from '$lib/types/model';

	export let response: ModelResponse;
	export let model: Model | undefined;

	function formatCost(cost: number | undefined): string {
		if (cost === undefined || cost === null || isNaN(cost)) return '$0.0000';
		if (cost === 0) return '$0.0000';
		// Show more precision for very small costs
		if (cost < 0.0001) {
			return `$${cost.toFixed(8)}`; // Show 8 decimal places for tiny amounts
		}
		if (cost < 0.01) {
			return `$${cost.toFixed(6)}`; // Show 6 decimal places for small amounts
		}
		return `$${cost.toFixed(4)}`; // Show 4 decimal places for larger amounts
	}

	function formatDuration(ms: number | undefined): string {
		if (!ms) return '-';
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
	}

	function formatTokenSpeed(speed: number | undefined): string {
		if (!speed) return '-';
		return `${speed.toFixed(1)} tok/s`;
	}
</script>

<Card class="p-4">
	<div class="space-y-3">
		<!-- Header -->
		<div class="flex items-start justify-between">
			<div class="flex items-center gap-2">
				<h4 class="font-medium text-slate-900">
					{model?.name || response.modelId}
				</h4>
				{#if response.status === 'running'}
					<Badge variant="warning" size="sm">Running</Badge>
				{:else if response.status === 'completed'}
					<Badge variant="success" size="sm">Completed</Badge>
				{:else if response.status === 'error'}
					<Badge variant="danger" size="sm">Error</Badge>
				{:else}
					<Badge variant="secondary" size="sm">Pending</Badge>
				{/if}
			</div>
			{#if response.cost !== undefined}
				<span class="text-sm font-medium text-slate-700">
					{formatCost(response.cost)}
				</span>
			{/if}
		</div>

		<!-- Metrics -->
		{#if response.status === 'completed' || response.status === 'running'}
			<div class="flex flex-wrap items-center gap-3 text-xs text-slate-600">
				{#if response.totalTokens}
					<span>Tokens: {response.totalTokens.toLocaleString()}</span>
				{/if}
				{#if response.latencyMs}
					<span title="End-to-end latency">Total: {formatDuration(response.latencyMs)}</span>
				{/if}
				{#if response.openRouterLatencyMs}
					<span title="OpenRouter reported latency" class="text-blue-600">
						OR: {formatDuration(response.openRouterLatencyMs)}
					</span>
				{/if}
				{#if response.latencyMs && response.openRouterLatencyMs}
					<span title="Network overhead" class="text-slate-500">
						Network: {formatDuration(response.latencyMs - response.openRouterLatencyMs)}
					</span>
				{/if}
				{#if response.timeToFirstTokenMs}
					<span title="Time to first token"
						>TTFT: {formatDuration(response.timeToFirstTokenMs)}</span
					>
				{/if}
				{#if response.tokensPerSecond}
					<span>{formatTokenSpeed(response.tokensPerSecond)}</span>
				{/if}
			</div>
		{/if}

		<!-- Response Content -->
		<div class="border-t pt-3">
			{#if response.status === 'error'}
				<div class="rounded bg-red-50 p-3 text-sm text-red-600">
					{response.errorMessage || 'An error occurred'}
				</div>
			{:else if response.responseText}
				<div class="prose prose-sm max-w-none">
					<pre
						class="overflow-x-auto rounded bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-800">
{response.responseText}{#if response.status === 'running'}<span class="inline-block w-2 h-4 bg-slate-600 animate-pulse ml-0.5" />{/if}</pre>
				</div>
			{:else if response.status === 'running'}
				<div class="flex items-center gap-2 text-slate-600">
					<Spinner size="sm" />
					<span class="text-sm">Generating response...</span>
				</div>
			{:else}
				<div class="text-sm text-slate-500 italic">Waiting to start...</div>
			{/if}
		</div>
	</div>
</Card>
