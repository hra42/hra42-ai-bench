<script lang="ts">
	import TextArea from '../atoms/TextArea.svelte';

	export let value: string;
	export let placeholder = 'Enter your prompt here...';
	export let maxLength = 10000;
	export let rows = 6;
	export let disabled = false;

	$: characterCount = value.length;
	$: characterPercentage = (characterCount / maxLength) * 100;
</script>

<div class="space-y-2">
	<TextArea bind:value {placeholder} {rows} {disabled} maxlength={maxLength} />

	<div class="flex items-center justify-between text-sm">
		<span class="text-slate-500 dark:text-slate-400">
			{#if characterCount > 0}
				{characterCount.toLocaleString()} / {maxLength.toLocaleString()} characters
			{:else}
				Maximum {maxLength.toLocaleString()} characters
			{/if}
		</span>

		<div class="h-1 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
			<div
				class="h-full rounded-full transition-all duration-300
					{characterPercentage < 80 ? 'bg-blue-500' : ''}
					{characterPercentage >= 80 && characterPercentage < 95 ? 'bg-amber-500' : ''}
					{characterPercentage >= 95 ? 'bg-red-500' : ''}"
				style="width: {Math.min(characterPercentage, 100)}%"
			></div>
		</div>
	</div>
</div>
