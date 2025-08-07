<script lang="ts">
	export let inputTokens: number;
	export let outputTokens: number;
	export let maxTokens: number | undefined = undefined;
	export let showBar = true;

	$: totalTokens = inputTokens + outputTokens;
	$: inputPercentage = maxTokens ? (inputTokens / maxTokens) * 100 : 0;
	$: outputPercentage = maxTokens ? (outputTokens / maxTokens) * 100 : 0;
	$: totalPercentage = maxTokens ? (totalTokens / maxTokens) * 100 : 0;
</script>

<div class="space-y-2">
	<div class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-wrap items-center gap-2 sm:gap-4">
			<span class="flex items-center gap-1.5">
				<span class="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
				<span class="text-slate-600 dark:text-slate-400">Input:</span>
				<span class="font-mono font-medium text-slate-900 dark:text-white">{inputTokens.toLocaleString()}</span>
			</span>

			<span class="flex items-center gap-1.5">
				<span class="h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></span>
				<span class="text-slate-600 dark:text-slate-400">Output:</span>
				<span class="font-mono font-medium text-slate-900 dark:text-white">{outputTokens.toLocaleString()}</span>
			</span>

			<span class="flex items-center gap-1.5">
				<span class="text-slate-600 dark:text-slate-400">Total:</span>
				<span class="font-mono font-medium text-slate-900 dark:text-white">{totalTokens.toLocaleString()}</span>
			</span>
		</div>

		{#if maxTokens}
			<span class="text-slate-500 dark:text-slate-400 whitespace-nowrap">
				{totalPercentage.toFixed(1)}% of {maxTokens.toLocaleString()}
			</span>
		{/if}
	</div>

	{#if showBar && maxTokens}
		<div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
			<div class="flex h-full">
				<div
					class="bg-blue-500 transition-all duration-300"
					style="width: {Math.min(inputPercentage, 100)}%"
				></div>
				<div
					class="bg-green-500 transition-all duration-300"
					style="width: {Math.min(outputPercentage, 100 - inputPercentage)}%"
				></div>
			</div>
		</div>
	{/if}
</div>
