<script lang="ts">
	import Input from '../atoms/Input.svelte';

	export let models: Array<{ id: string; name: string; provider: string }> = [];
	export let selected: string[] = [];

	let searchQuery = '';
	let showAll = false;

	$: filteredModels = searchQuery
		? models.filter(
				(model) =>
					model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					model.id.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: models;

	$: displayedModels = showAll || searchQuery ? filteredModels : filteredModels.slice(0, 12);

	function toggleModel(modelId: string) {
		if (selected.includes(modelId)) {
			selected = selected.filter((id) => id !== modelId);
		} else {
			selected = [...selected, modelId];
		}
	}

	function selectAll() {
		selected = filteredModels.map((m) => m.id);
	}

	function clearSelection() {
		selected = [];
	}
</script>

<div class="space-y-4">
	<div class="flex items-center gap-4">
		<Input bind:value={searchQuery} placeholder="Search models..." type="search" />

		<div class="flex items-center gap-2">
			<button
				class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
				on:click={selectAll}
			>
				Select All
			</button>
			<span class="text-slate-400 dark:text-slate-600">|</span>
			<button
				class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
				on:click={clearSelection}
			>
				Clear
			</button>
		</div>
	</div>

	<div
		class="max-h-96 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700"
	>
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{#each displayedModels as model (model.id)}
				<button
					class="rounded-lg border-2 p-3 text-left transition-all
						{selected.includes(model.id)
						? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
						: 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'}"
					on:click={() => toggleModel(model.id)}
				>
					<div class="flex items-start justify-between">
						<div>
							<p class="font-medium text-slate-900 dark:text-white">{model.name}</p>
							<p class="text-xs text-slate-500 dark:text-slate-400">{model.provider}</p>
						</div>
						{#if selected.includes(model.id)}
							<svg
								class="h-5 w-5 text-blue-500 dark:text-blue-400"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
						{/if}
					</div>
				</button>
			{/each}
		</div>

		{#if !showAll && !searchQuery && filteredModels.length > 12}
			<div class="mt-4 text-center">
				<button
					class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
					on:click={() => (showAll = true)}
				>
					Show all {filteredModels.length} models
				</button>
			</div>
		{/if}

		{#if showAll && !searchQuery}
			<div class="mt-4 text-center">
				<button
					class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
					on:click={() => (showAll = false)}
				>
					Show less
				</button>
			</div>
		{/if}
	</div>

	{#if filteredModels.length === 0}
		<div class="py-8 text-center text-slate-500 dark:text-slate-400">
			No models found matching "{searchQuery}"
		</div>
	{/if}

	{#if selected.length > 0}
		<div
			class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
		>
			<p class="text-sm text-blue-700 dark:text-blue-300">
				{selected.length} model{selected.length !== 1 ? 's' : ''} selected
			</p>
		</div>
	{/if}
</div>
