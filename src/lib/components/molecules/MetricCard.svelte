<script lang="ts">
	export let label: string;
	export let value: string | number;
	export let description: string | undefined = undefined;
	export let icon: string | undefined = undefined;
	export let variant: 'default' | 'success' | 'warning' | 'danger' = 'default';

	const variantClasses = {
		default: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
		success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
		warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
		danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
	};

	const iconColors = {
		default: 'text-slate-500 dark:text-slate-400',
		success: 'text-green-600 dark:text-green-400',
		warning: 'text-amber-600 dark:text-amber-400',
		danger: 'text-red-600 dark:text-red-400'
	};
</script>

<div class="rounded-lg border p-4 {variantClasses[variant]}">
	<div class="flex items-start justify-between">
		<div class="flex-1">
			<p class="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
			<p class="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
			{#if description}
				<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
			{/if}
		</div>
		{#if icon}
			<div class="ml-4 {iconColors[variant]}">
				{@html icon}
			</div>
		{/if}
	</div>
</div>
