<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface $$Props extends HTMLSelectAttributes {
		label?: string;
		error?: string;
		hint?: string;
		options: Array<{ value: string; label: string }>;
	}

	export let label: $$Props['label'] = '';
	export let error: $$Props['error'] = '';
	export let hint: $$Props['hint'] = '';
	export let value: $$Props['value'] = '';
	export let options: $$Props['options'];
	export let id: $$Props['id'] = crypto.randomUUID();

	$: selectClass = `
    w-full px-3 py-2 border rounded-lg
    text-slate-900 bg-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-slate-50 disabled:text-slate-500
    ${error ? 'border-red-500' : 'border-slate-300'}
  `;
</script>

<div class="w-full">
	{#if label}
		<label for={id} class="mb-1 block text-sm font-medium text-slate-700">
			{label}
		</label>
	{/if}

	<select
		{id}
		bind:value
		class={selectClass}
		aria-invalid={!!error}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
		{...$$restProps}
		on:change
		on:blur
		on:focus
	>
		<slot name="placeholder">
			<option value="" disabled selected>Select an option</option>
		</slot>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	{#if error}
		<p id="{id}-error" class="mt-1 text-sm text-red-600">{error}</p>
	{:else if hint}
		<p id="{id}-hint" class="mt-1 text-sm text-slate-500">{hint}</p>
	{/if}
</div>
