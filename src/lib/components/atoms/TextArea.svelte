<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  
  interface $$Props extends HTMLTextareaAttributes {
    label?: string;
    error?: string;
    hint?: string;
  }
  
  export let label: $$Props['label'] = '';
  export let error: $$Props['error'] = '';
  export let hint: $$Props['hint'] = '';
  export let value: $$Props['value'] = '';
  export let id: $$Props['id'] = crypto.randomUUID();
  export let rows: $$Props['rows'] = 4;
  
  $: textareaClass = `
    w-full px-3 py-2 border rounded-lg
    text-slate-900 placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-slate-50 disabled:text-slate-500
    ${error ? 'border-red-500' : 'border-slate-300'}
  `;
</script>

<div class="w-full">
  {#if label}
    <label for={id} class="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
  {/if}
  
  <textarea
    {id}
    {rows}
    bind:value
    class={textareaClass}
    aria-invalid={!!error}
    aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
    {...$$restProps}
    on:input
    on:change
    on:blur
    on:focus
  ></textarea>
  
  {#if error}
    <p id="{id}-error" class="mt-1 text-sm text-red-600">{error}</p>
  {:else if hint}
    <p id="{id}-hint" class="mt-1 text-sm text-slate-500">{hint}</p>
  {/if}
</div>