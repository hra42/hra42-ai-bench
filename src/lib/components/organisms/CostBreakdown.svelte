<script lang="ts">
	import Card from '../atoms/Card.svelte';
	import CostDisplay from '../molecules/CostDisplay.svelte';

	export let models: Array<{
		name: string;
		inputCost: number;
		outputCost: number;
		totalCost: number;
		inputTokens: number;
		outputTokens: number;
	}> = [];

	$: totalInputCost = models.reduce((sum, m) => sum + m.inputCost, 0);
	$: totalOutputCost = models.reduce((sum, m) => sum + m.outputCost, 0);
	$: grandTotal = totalInputCost + totalOutputCost;

	$: sortedModels = [...models].sort((a, b) => b.totalCost - a.totalCost);
</script>

<Card>
	<div class="space-y-4">
		<h3 class="text-lg font-semibold text-slate-900 dark:text-white">Cost Breakdown</h3>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
				<p class="text-sm font-medium text-blue-700 dark:text-blue-300">Input Costs</p>
				<div class="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">
					<CostDisplay cost={totalInputCost} />
				</div>
			</div>

			<div class="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
				<p class="text-sm font-medium text-green-700 dark:text-green-300">Output Costs</p>
				<div class="mt-1 text-2xl font-bold text-green-900 dark:text-green-200">
					<CostDisplay cost={totalOutputCost} />
				</div>
			</div>

			<div class="rounded-lg bg-slate-100 dark:bg-slate-800 p-4">
				<p class="text-sm font-medium text-slate-700 dark:text-slate-300">Total Cost</p>
				<div class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
					<CostDisplay cost={grandTotal} />
				</div>
			</div>
		</div>

		<div class="space-y-2">
			<h4 class="text-sm font-medium text-slate-700 dark:text-slate-300">Per Model Breakdown</h4>

			{#each sortedModels as model}
				<div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-2 last:border-0">
					<div class="flex-1">
						<p class="font-medium text-slate-900 dark:text-white">{model.name}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">
							{model.inputTokens.toLocaleString()} input • {model.outputTokens.toLocaleString()} output
							tokens
						</p>
					</div>

					<div class="text-right">
						<CostDisplay cost={model.totalCost} size="sm" />
						<div class="mt-1 flex items-center gap-2">
							<span class="text-xs text-slate-500 dark:text-slate-400">
								Input: <CostDisplay cost={model.inputCost} size="sm" />
							</span>
							<span class="text-xs text-slate-500 dark:text-slate-400">
								Output: <CostDisplay cost={model.outputCost} size="sm" />
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if models.length > 1}
			<div class="border-t border-slate-200 dark:border-slate-700 pt-4">
				<h4 class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Cost Distribution</h4>
				<div class="flex h-8 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
					{#each sortedModels as model}
						{@const percentage = (model.totalCost / grandTotal) * 100}
						<div
							class="h-full transition-all duration-300"
							class:bg-blue-500={sortedModels.indexOf(model) === 0}
							class:bg-blue-400={sortedModels.indexOf(model) === 1}
							class:bg-blue-300={sortedModels.indexOf(model) === 2}
							class:bg-slate-300={sortedModels.indexOf(model) > 2}
							style="width: {percentage}%"
							title="{model.name}: {percentage.toFixed(1)}%"
						></div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Card>
