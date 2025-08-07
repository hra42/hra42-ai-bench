<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface $$Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		hint?: string;
	}

	export let label: $$Props['label'] = '';
	export let error: $$Props['error'] = '';
	export let hint: $$Props['hint'] = '';
	export let value: $$Props['value'] = '';
	export let id: $$Props['id'] = crypto.randomUUID();

	$: inputClass = `
    w-full px-3 py-2 border rounded-lg
    text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
    bg-white dark:bg-slate-700
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400
    ${error ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'}
  `;
</script>

<div class="w-full">
	{#if label}
		<label for={id} class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
			{label}
		</label>
	{/if}

	<input
		{id}
		bind:value
		class={inputClass}
		aria-invalid={!!error}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
		{...$$restProps}
		on:input
		on:change
		on:blur
		on:focus
	/>

	{#if error}
		<p id="{id}-error" class="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
	{:else if hint}
		<p id="{id}-hint" class="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
	{/if}
</div>
