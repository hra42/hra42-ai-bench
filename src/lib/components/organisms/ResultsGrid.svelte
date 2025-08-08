<script lang="ts">
	import { modelResponses, currentRun } from '$lib/stores/benchmark';
	import { availableModels } from '$lib/stores/models';
	import ResponseCard from '$lib/components/molecules/ResponseCard.svelte';
	import Card from '$lib/components/atoms/Card.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';

	function formatCost(cost: number): string {
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

	$: totalCost = $modelResponses.reduce((sum, r) => sum + (r.cost || 0), 0);
	$: completedCount = $modelResponses.filter((r) => r.status === 'completed').length;
	$: errorCount = $modelResponses.filter((r) => r.status === 'error').length;
</script>

{#if $currentRun}
	<div class="space-y-4">
		<!-- Summary Card -->
		<Card class="p-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold text-slate-900">
						{$currentRun.name}
					</h3>
					<p class="mt-1 text-sm text-slate-600">
						Benchmark Type: {$currentRun.benchmarkType}
					</p>
				</div>
				<div class="text-right">
					<div class="text-sm text-slate-600">
						Progress: {completedCount + errorCount}/{$currentRun.totalModels}
					</div>
					<div class="text-lg font-semibold text-slate-900">
						{formatCost(totalCost)}
					</div>
				</div>
			</div>

			{#if $currentRun.status === 'running'}
				<div class="mt-4">
					<div class="mb-1 flex justify-between text-sm">
						<span>Progress</span>
						<span
							>{Math.round(((completedCount + errorCount) / $currentRun.totalModels) * 100)}%</span
						>
					</div>
					<div class="h-2 w-full rounded-full bg-slate-200">
						<div
							class="h-2 rounded-full bg-blue-600 transition-all duration-300"
							style="width: {((completedCount + errorCount) / $currentRun.totalModels) * 100}%"
						></div>
					</div>
				</div>
			{:else if $currentRun.status === 'completed'}
				<div class="mt-3 flex gap-2">
					<Badge variant="success">Completed</Badge>
					{#if errorCount > 0}
						<Badge variant="danger">{errorCount} Error{errorCount !== 1 ? 's' : ''}</Badge>
					{/if}
				</div>
			{/if}
		</Card>

		<!-- Results Grid -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each $modelResponses as response (response.modelId)}
				<ResponseCard {response} model={$availableModels.find((m) => m.id === response.modelId)} />
			{/each}
		</div>
	</div>
{:else if $modelResponses.length === 0}
	<Card class="p-8">
		<div class="text-center text-slate-500">
			<p class="mb-2 text-lg font-medium">No benchmark running</p>
			<p class="text-sm">Configure and start a benchmark to see results here</p>
		</div>
	</Card>
{/if}
