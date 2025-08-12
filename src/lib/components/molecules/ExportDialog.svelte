<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../atoms/Button.svelte';
	import Card from '../atoms/Card.svelte';
	import Select from '../atoms/Select.svelte';
	import type { ExportFormat } from '$lib/utils/export';

	export let isOpen = false;
	export let title = 'Export Data';
	export let description = 'Choose the format for your export';
	export let loading = false;

	const dispatch = createEventDispatcher();

	let selectedFormat: ExportFormat = 'csv';

	const formatOptions = [
		{ value: 'csv', label: 'CSV - Spreadsheet compatible' },
		{ value: 'json', label: 'JSON - Machine readable' }
	];

	function handleExport() {
		dispatch('export', { format: selectedFormat });
	}

	function handleClose() {
		isOpen = false;
		dispatch('close');
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="bg-opacity-50 absolute inset-0 bg-black"
			on:click={handleClose}
			aria-label="Close dialog"
		/>

		<div class="relative w-full max-w-md">
			<Card>
				<div class="p-6">
					<h2 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
						{title}
					</h2>

					<p class="mb-6 text-sm text-slate-600 dark:text-slate-400">
						{description}
					</p>

					<div class="mb-6 space-y-4">
						<div>
							<label
								for="format"
								class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
							>
								Export Format
							</label>
							<Select id="format" bind:value={selectedFormat} options={formatOptions} />
						</div>

						<div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
							<h3 class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
								Format Details
							</h3>
							{#if selectedFormat === 'csv'}
								<ul class="space-y-1 text-xs text-slate-600 dark:text-slate-400">
									<li>• Compatible with Excel, Google Sheets, and other spreadsheet apps</li>
									<li>• Simple flat structure</li>
									<li>• Good for data analysis and reporting</li>
								</ul>
							{:else if selectedFormat === 'json'}
								<ul class="space-y-1 text-xs text-slate-600 dark:text-slate-400">
									<li>• Complete data structure with all details</li>
									<li>• Preserves nested relationships</li>
									<li>• Ideal for programmatic processing</li>
								</ul>
							{/if}
						</div>
					</div>

					<div class="flex justify-end gap-3">
						<Button variant="secondary" on:click={handleClose} disabled={loading}>Cancel</Button>
						<Button variant="primary" on:click={handleExport} disabled={loading}>
							{#if loading}
								Exporting...
							{:else}
								Export
							{/if}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	</div>
{/if}
