<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../atoms/Button.svelte';
	import Card from '../atoms/Card.svelte';
	import MetricCard from '../molecules/MetricCard.svelte';
	import CostDisplay from '../molecules/CostDisplay.svelte';

	export let totalBenchmarks = 0;
	export let totalCost = 0;
	export let avgResponseTime = 0;
	export let modelsTested = 0;
	export let recentBenchmarks: Array<{
		id: string;
		name: string;
		type: string;
		modelCount: number;
		cost: number;
		createdAt: Date;
	}> = [];
	export let topModels: Array<{
		name: string;
		usageCount: number;
		avgCost: number;
		avgTime: number;
	}> = [];

	const dispatch = createEventDispatcher();

	function navigateToBenchmark() {
		dispatch('navigate', { to: '/benchmark' });
	}

	function viewBenchmark(id: string) {
		dispatch('view', { id });
	}
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="space-y-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
					<p class="mt-2 text-slate-600 dark:text-slate-400">
						Overview of your LLM benchmarking activity
					</p>
				</div>

				<Button variant="primary" size="lg" on:click={navigateToBenchmark}>New Benchmark</Button>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					label="Total Benchmarks"
					value={totalBenchmarks}
					description="All time"
					icon={`<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>`}
				/>

				<MetricCard
					label="Total Cost"
					value={new Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: 'USD',
						minimumFractionDigits: 2
					}).format(totalCost)}
					description="Across all benchmarks"
					variant="warning"
					icon={`<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`}
				/>

				<MetricCard
					label="Avg Response Time"
					value={`${(avgResponseTime / 1000).toFixed(2)}s`}
					description="Mean across all models"
					variant="success"
					icon={`<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`}
				/>

				<MetricCard
					label="Models Tested"
					value={modelsTested}
					description="Unique models"
					icon={`<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>`}
				/>
			</div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<div class="p-6">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-lg font-semibold text-slate-900 dark:text-white">
								Recent Benchmarks
							</h2>
						</div>

						{#if recentBenchmarks.length > 0}
							<div class="space-y-3">
								{#each recentBenchmarks as benchmark (benchmark.id)}
									<button
										class="w-full rounded-lg p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
										on:click={() => viewBenchmark(benchmark.id)}
									>
										<div class="flex items-center justify-between">
											<div>
												<p class="font-medium text-slate-900 dark:text-white">{benchmark.name}</p>
												<p class="text-sm text-slate-500 dark:text-slate-400">
													{benchmark.type} • {benchmark.modelCount} models
												</p>
											</div>
											<div class="text-right">
												<CostDisplay cost={benchmark.cost} size="sm" />
												<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
													{benchmark.createdAt.toLocaleDateString()}
												</p>
											</div>
										</div>
									</button>
								{/each}
							</div>
						{:else}
							<p class="py-8 text-center text-slate-500 dark:text-slate-400">No benchmarks yet</p>
						{/if}
					</div>
				</Card>

				<Card>
					<div class="p-6">
						<h2 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
							Top Performing Models
						</h2>

						{#if topModels.length > 0}
							<div class="space-y-3">
								{#each topModels as model (model.name)}
									<div
										class="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700"
									>
										<div>
											<p class="font-medium text-slate-900 dark:text-white">{model.name}</p>
											<p class="text-sm text-slate-500 dark:text-slate-400">
												Used {model.usageCount} time{model.usageCount !== 1 ? 's' : ''}
											</p>
										</div>
										<div class="text-right">
											<div class="text-sm font-medium text-slate-900 dark:text-white">
												Avg: <CostDisplay cost={model.avgCost} size="sm" />
											</div>
											<p class="text-xs text-slate-500 dark:text-slate-400">
												~{(model.avgTime / 1000).toFixed(1)}s response
											</p>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="py-8 text-center text-slate-500 dark:text-slate-400">No model data yet</p>
						{/if}
					</div>
				</Card>
			</div>
		</div>
	</div>
</div>
