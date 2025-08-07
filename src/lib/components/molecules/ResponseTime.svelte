<script lang="ts">
	export let duration: number; // in milliseconds
	export let showIcon = true;
	export let variant: 'default' | 'fast' | 'slow' = 'default';

	type VariantType = 'default' | 'fast' | 'slow';

	$: seconds = duration / 1000;
	$: displayTime = seconds < 1 ? `${duration}ms` : `${seconds.toFixed(2)}s`;

	$: autoVariant = seconds < 1 ? 'fast' : seconds > 10 ? 'slow' : 'default';
	$: finalVariant = (variant === 'default' ? autoVariant : variant) as VariantType;

	const variantClasses: Record<VariantType, string> = {
		default: 'text-slate-600 dark:text-slate-400',
		fast: 'text-green-600 dark:text-green-400',
		slow: 'text-amber-600 dark:text-amber-400'
	};
</script>

<span class="inline-flex items-center gap-1.5 {variantClasses[finalVariant]}">
	{#if showIcon}
		<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	{/if}
	<span class="font-mono text-sm">{displayTime}</span>
</span>
