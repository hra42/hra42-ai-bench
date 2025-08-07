<script lang="ts">
	import { onMount } from 'svelte';
	import {
		availableModels,
		selectedModels,
		modelsLoading,
		modelsError,
		loadModels
	} from '$lib/stores/models';
	import Card from '$lib/components/atoms/Card.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import Input from '$lib/components/atoms/Input.svelte';
	import Spinner from '$lib/components/atoms/Spinner.svelte';
	import type { Model } from '$lib/types/model';

	let searchQuery = '';
	let filteredModels: Model[] = [];

	$: {
		if (searchQuery) {
			filteredModels = $availableModels.filter(
				(model) =>
					model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					model.id.toLowerCase().includes(searchQuery.toLowerCase())
			);
		} else {
			filteredModels = $availableModels;
		}
	}

	function toggleModel(modelId: string) {
		selectedModels.update((models) => {
			if (models.includes(modelId)) {
				return models.filter((id) => id !== modelId);
			} else {
				return [...models, modelId];
			}
		});
	}

	function selectAll() {
		selectedModels.set(filteredModels.map((m) => m.id));
	}

	function clearSelection() {
		selectedModels.set([]);
	}

	function formatPrice(price: number): string {
		return `$${(price * 1000000).toFixed(2)}/M`;
	}

	onMount(() => {
		if ($availableModels.length === 0) {
			loadModels();
		}
	});
</script>

<Card class="p-6">
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-slate-900">Select Models</h3>
			<div class="flex items-center gap-2">
				<span class="text-sm text-slate-600">
					{$selectedModels.length} selected
				</span>
				<button
					on:click={selectAll}
					class="text-sm text-blue-600 hover:text-blue-700"
					disabled={$modelsLoading}
				>
					Select All
				</button>
				<button
					on:click={clearSelection}
					class="text-sm text-slate-600 hover:text-slate-700"
					disabled={$modelsLoading || $selectedModels.length === 0}
				>
					Clear
				</button>
			</div>
		</div>

		<Input
			type="text"
			placeholder="Search models..."
			bind:value={searchQuery}
			disabled={$modelsLoading}
			class="w-full"
		/>

		{#if $modelsLoading}
			<div class="flex justify-center py-8">
				<Spinner />
			</div>
		{:else if $modelsError}
			<div class="rounded-lg bg-red-50 p-4 text-sm text-red-600">
				{$modelsError}
			</div>
		{:else if filteredModels.length === 0}
			<div class="py-8 text-center text-slate-500">
				{searchQuery ? 'No models found matching your search' : 'No models available'}
			</div>
		{:else}
			<div class="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
				{#each filteredModels as model}
					<button
						on:click={() => toggleModel(model.id)}
						class="w-full rounded-lg border p-3 text-left transition-colors
              {$selectedModels.includes(model.id)
							? 'border-blue-500 bg-blue-50'
							: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}"
					>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<span class="font-medium text-slate-900">{model.name}</span>
									{#if model.topProvider}
										<Badge variant="secondary" size="sm">{model.topProvider}</Badge>
									{/if}
								</div>
								{#if model.description}
									<p class="mt-1 line-clamp-2 text-sm text-slate-600">{model.description}</p>
								{/if}
								<div class="mt-2 flex items-center gap-4">
									<span class="text-xs text-slate-500">
										Context: {(model.contextLength || 0).toLocaleString()} tokens
									</span>
									<span class="text-xs text-slate-500">
										Input: {formatPrice(model.pricing?.prompt || 0)}
									</span>
									<span class="text-xs text-slate-500">
										Output: {formatPrice(model.pricing?.completion || 0)}
									</span>
								</div>
								<div class="mt-2 flex gap-2">
									{#if model.supportsVision}
										<Badge variant="success" size="sm">Vision</Badge>
									{/if}
									{#if model.supportsTools}
										<Badge variant="info" size="sm">Tools</Badge>
									{/if}
									{#if model.supportsJsonOutput}
										<Badge variant="warning" size="sm">JSON</Badge>
									{/if}
								</div>
							</div>
							<div class="ml-4">
								<input
									type="checkbox"
									checked={$selectedModels.includes(model.id)}
									class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
									on:click|stopPropagation
								/>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</Card>
