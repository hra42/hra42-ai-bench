<script lang="ts">
	export let orientation: 'horizontal' | 'vertical' = 'horizontal';
	export let variant: 'solid' | 'dashed' | 'dotted' = 'solid';
	export let spacing: 'sm' | 'md' | 'lg' = 'md';
	export let label: string | undefined = undefined;

	const spacingClasses = {
		sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
		md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
		lg: orientation === 'horizontal' ? 'my-6' : 'mx-6'
	};

	const variantClasses = {
		solid: 'border-solid',
		dashed: 'border-dashed',
		dotted: 'border-dotted'
	};
</script>

{#if orientation === 'horizontal'}
	<div class="relative {spacingClasses[spacing]}">
		<div class="absolute inset-0 flex items-center" aria-hidden="true">
			<div
				class="w-full border-t border-slate-200 dark:border-slate-700 {variantClasses[variant]}"
			/>
		</div>
		{#if label}
			<div class="relative flex justify-center">
				<span class="bg-white px-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
					{label}
				</span>
			</div>
		{/if}
	</div>
{:else}
	<div
		class="inline-block h-full border-l border-slate-200 dark:border-slate-700 {variantClasses[
			variant
		]} {spacingClasses[spacing]}"
	/>
{/if}
