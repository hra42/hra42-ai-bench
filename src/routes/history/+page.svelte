<script lang="ts">
	import HistoryView from '$lib/components/templates/HistoryView.svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	function handleNavigate(event: CustomEvent) {
		goto(event.detail.to);
	}

	function handleView(event: CustomEvent) {
		// Navigate to benchmark details or open modal
		console.log('View benchmark:', event.detail.id);
	}
</script>

<HistoryView
	benchmarks={data.benchmarks}
	on:navigate={handleNavigate}
	on:view={handleView}
/>