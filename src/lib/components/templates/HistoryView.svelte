<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../atoms/Button.svelte';
	import Card from '../atoms/Card.svelte';
	import Input from '../atoms/Input.svelte';
	import Select from '../atoms/Select.svelte';
	import HistoryTable from '../organisms/HistoryTable.svelte';

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
	export let searchQuery = '';
	export let filterType = 'all';
	export let filterStatus = 'all';
	export let sortBy: 'date' | 'cost' | 'duration' | 'name' = 'date';
	export let sortOrder: 'asc' | 'desc' = 'desc';

	const dispatch = createEventDispatcher();

	const benchmarkTypes = [
		{ value: 'all', label: 'All Types' },
		{ value: 'text', label: 'Text Generation' },
		{ value: 'structured', label: 'Structured Output' },
		{ value: 'tool', label: 'Tool/Function' },
		{ value: 'vision', label: 'Vision' },
		{ value: 'document', label: 'Document' }
	];

	const statusOptions = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'failed', label: 'Failed' },
		{ value: 'running', label: 'Running' },
		{ value: 'pending', label: 'Pending' }
	];

	$: filteredBenchmarks = benchmarks.filter((b) => {
		const matchesSearch =
			searchQuery === '' ||
			b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			b.models.some((m: string) => m.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesType = filterType === 'all' || b.type === filterType;
		const matchesStatus = filterStatus === 'all' || b.status === filterStatus;

		return matchesSearch && matchesType && matchesStatus;
	});


	function handleNewBenchmark() {
		dispatch('navigate', { to: '/benchmark' });
	}
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Benchmark History</h1>
					<p class="mt-2 text-slate-600 dark:text-slate-400">
						View and analyze all your past benchmarks
					</p>
				</div>

				<Button variant="primary" on:click={handleNewBenchmark}>New Benchmark</Button>
			</div>

			<Card>
				<div class="p-6">
					<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
						<div class="md:col-span-2">
							<Input
								bind:value={searchQuery}
								placeholder="Search benchmarks or models..."
								type="search"
							/>
						</div>

						<Select bind:value={filterType} options={benchmarkTypes} />

						<Select bind:value={filterStatus} options={statusOptions} />
					</div>

					<div class="mb-4 flex items-center justify-between">
						<p class="text-sm text-slate-600">
							Showing {filteredBenchmarks.length} of {benchmarks.length} benchmarks
						</p>

						{#if searchQuery || filterType !== 'all' || filterStatus !== 'all'}
							<button
								class="text-sm font-medium text-blue-600 hover:text-blue-700"
								on:click={() => {
									searchQuery = '';
									filterType = 'all';
									filterStatus = 'all';
								}}
							>
								Clear filters
							</button>
						{/if}
					</div>

					<HistoryTable
						benchmarks={filteredBenchmarks}
						bind:sortBy
						bind:sortOrder
						on:view
						on:sort
					/>
				</div>
			</Card>
		</div>
	</div>
</div>
