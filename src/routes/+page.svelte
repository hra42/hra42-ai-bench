<script lang="ts">
	import DashboardView from '$lib/components/templates/DashboardView.svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	function handleNavigate(event: CustomEvent) {
		goto(event.detail.to);
	}

	function handleViewBenchmark(event: CustomEvent) {
		// For now, just log - could navigate to a benchmark details page later
		console.log('View benchmark:', event.detail.id);
	}
</script>

<DashboardView
	totalBenchmarks={data.totalBenchmarks}
	totalCost={data.totalCost}
	avgResponseTime={data.avgResponseTime}
	modelsTested={data.modelsTested}
	recentBenchmarks={data.recentBenchmarks}
	topModels={data.topModels}
	on:navigate={handleNavigate}
	on:view={handleViewBenchmark}
/>
