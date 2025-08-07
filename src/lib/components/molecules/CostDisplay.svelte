<script lang="ts">
	export let cost: number;
	export let previousCost: number | undefined = undefined;
	export let showTrend = false;
	export let size: 'sm' | 'md' | 'lg' = 'md';

	const sizeClasses = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg'
	};

	$: formattedCost = (() => {
		// Handle invalid values
		if (typeof cost !== 'number' || isNaN(cost)) {
			return '$0.0000';
		}
		
		// Handle very small numbers (scientific notation)
		if (cost > 0 && cost < 0.0001) {
			// Use more decimal places for very small numbers
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 8,
				maximumFractionDigits: 8
			}).format(cost);
		}
		
		// Normal formatting for regular numbers
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 4,
			maximumFractionDigits: 4
		}).format(cost);
	})();

	$: trend = previousCost !== undefined ? ((cost - previousCost) / previousCost) * 100 : 0;
	$: trendDirection = trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
</script>

<div class="inline-flex items-center gap-2">
	<span class="font-mono {sizeClasses[size]} text-slate-900 dark:text-slate-100">
		{formattedCost}
	</span>

	{#if showTrend && previousCost !== undefined && trend !== 0}
		<span
			class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
				{trendDirection === 'up' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}
				{trendDirection === 'down' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : ''}"
		>
			{#if trendDirection === 'up'}
				<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
				</svg>
			{:else}
				<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			{/if}
			{Math.abs(trend).toFixed(1)}%
		</span>
	{/if}
</div>
