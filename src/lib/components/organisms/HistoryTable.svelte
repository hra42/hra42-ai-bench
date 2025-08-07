<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Badge from '../atoms/Badge.svelte';
	import CostDisplay from '../molecules/CostDisplay.svelte';
	import ResponseTime from '../molecules/ResponseTime.svelte';
	import StatusIndicator from '../molecules/StatusIndicator.svelte';

	export let benchmarks: Array<{
		id: string;
		name: string;
		type: string;
		models: string[];
		status: 'pending' | 'running' | 'completed' | 'failed';
		totalCost: number;
		avgDuration: number;
		createdAt: Date;
	}> = [];

	export let sortBy: 'date' | 'cost' | 'duration' | 'name' = 'date';
	export let sortOrder: 'asc' | 'desc' = 'desc';

	const dispatch = createEventDispatcher();

	function handleSort(column: typeof sortBy) {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'desc';
		}
		dispatch('sort', { sortBy, sortOrder });
	}

	function viewDetails(benchmark: (typeof benchmarks)[0]) {
		dispatch('view', { benchmark });
	}

	$: sortedBenchmarks = [...benchmarks].sort((a, b) => {
		let comparison = 0;

		switch (sortBy) {
			case 'date':
				comparison = a.createdAt.getTime() - b.createdAt.getTime();
				break;
			case 'cost':
				comparison = a.totalCost - b.totalCost;
				break;
			case 'duration':
				comparison = a.avgDuration - b.avgDuration;
				break;
			case 'name':
				comparison = a.name.localeCompare(b.name);
				break;
		}

		return sortOrder === 'asc' ? comparison : -comparison;
	});
</script>

<div class="overflow-x-auto">
	<table class="min-w-full divide-y divide-slate-200">
		<thead class="bg-slate-50">
			<tr>
				<th class="px-6 py-3 text-left">
					<button
						class="flex items-center gap-1 text-xs font-medium tracking-wider text-slate-500 uppercase hover:text-slate-700"
						on:click={() => handleSort('name')}
					>
						Benchmark
						{#if sortBy === 'name'}
							<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								{#if sortOrder === 'asc'}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 15l7-7 7 7"
									/>
								{:else}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								{/if}
							</svg>
						{/if}
					</button>
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
					Type
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
					Models
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
					Status
				</th>
				<th class="px-6 py-3 text-left">
					<button
						class="flex items-center gap-1 text-xs font-medium tracking-wider text-slate-500 uppercase hover:text-slate-700"
						on:click={() => handleSort('cost')}
					>
						Total Cost
						{#if sortBy === 'cost'}
							<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								{#if sortOrder === 'asc'}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 15l7-7 7 7"
									/>
								{:else}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								{/if}
							</svg>
						{/if}
					</button>
				</th>
				<th class="px-6 py-3 text-left">
					<button
						class="flex items-center gap-1 text-xs font-medium tracking-wider text-slate-500 uppercase hover:text-slate-700"
						on:click={() => handleSort('duration')}
					>
						Avg Duration
						{#if sortBy === 'duration'}
							<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								{#if sortOrder === 'asc'}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 15l7-7 7 7"
									/>
								{:else}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								{/if}
							</svg>
						{/if}
					</button>
				</th>
				<th class="px-6 py-3 text-left">
					<button
						class="flex items-center gap-1 text-xs font-medium tracking-wider text-slate-500 uppercase hover:text-slate-700"
						on:click={() => handleSort('date')}
					>
						Date
						{#if sortBy === 'date'}
							<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								{#if sortOrder === 'asc'}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 15l7-7 7 7"
									/>
								{:else}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								{/if}
							</svg>
						{/if}
					</button>
				</th>
				<th
					class="px-6 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase"
				>
					Actions
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-200 bg-white">
			{#each sortedBenchmarks as benchmark}
				<tr class="hover:bg-slate-50">
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="text-sm font-medium text-slate-900">{benchmark.name}</div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<Badge variant="primary">{benchmark.type}</Badge>
					</td>
					<td class="px-6 py-4">
						<div class="flex flex-wrap gap-1">
							{#each benchmark.models.slice(0, 3) as model}
								<Badge variant="secondary" size="sm">{model}</Badge>
							{/each}
							{#if benchmark.models.length > 3}
								<Badge variant="secondary" size="sm">+{benchmark.models.length - 3}</Badge>
							{/if}
						</div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<StatusIndicator status={benchmark.status} size="sm" />
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<CostDisplay cost={benchmark.totalCost} size="sm" />
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<ResponseTime duration={benchmark.avgDuration} showIcon={false} />
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
						{benchmark.createdAt.toLocaleDateString()}
						{benchmark.createdAt.toLocaleTimeString()}
					</td>
					<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
						<button
							class="text-blue-600 hover:text-blue-900"
							on:click={() => viewDetails(benchmark)}
						>
							View
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if benchmarks.length === 0}
		<div class="py-12 text-center">
			<svg
				class="mx-auto h-12 w-12 text-slate-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<h3 class="mt-2 text-sm font-medium text-slate-900">No benchmarks</h3>
			<p class="mt-1 text-sm text-slate-500">Get started by creating a new benchmark.</p>
		</div>
	{/if}
</div>
