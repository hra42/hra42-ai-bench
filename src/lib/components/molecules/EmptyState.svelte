<script lang="ts">
	import Button from '../atoms/Button.svelte';

	export let title = 'No data found';
	export let description = '';
	export let icon = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>`;
	export let actionLabel: string | undefined = undefined;
	export let onAction: (() => void) | undefined = undefined;
</script>

<div class="py-12 text-center">
	<div class="mx-auto mb-4 h-16 w-16 text-slate-400">
		{@html icon}
	</div>

	<h3 class="mb-1 text-lg font-medium text-slate-900">{title}</h3>

	{#if description}
		<p class="mx-auto mb-4 max-w-sm text-sm text-slate-500">{description}</p>
	{/if}

	{#if actionLabel && onAction}
		<Button variant="primary" size="sm" on:click={onAction}>
			{actionLabel}
		</Button>
	{/if}
</div>
