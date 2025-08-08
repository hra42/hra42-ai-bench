<script lang="ts">
	import Card from '../atoms/Card.svelte';
	import Skeleton from '../atoms/Skeleton.svelte';

	export let lines = 3;
	export let showHeader = true;
	export let showFooter = false;

	$: lineArray = Array.from({ length: lines }, (_, i) => i);
</script>

<Card>
	<div class="space-y-4">
		{#if showHeader}
			<div class="flex items-center justify-between">
				<Skeleton width="40%" height="1.5rem" />
				<Skeleton variant="circular" width="2rem" height="2rem" />
			</div>
		{/if}

		<div class="space-y-2">
			{#each lineArray as i (i)}
				<Skeleton width={i === lines - 1 ? '60%' : '100%'} height="1rem" />
			{/each}
		</div>

		{#if showFooter}
			<div class="flex items-center justify-between border-t border-slate-200 pt-4">
				<Skeleton width="30%" height="0.875rem" />
				<Skeleton width="20%" height="0.875rem" />
			</div>
		{/if}
	</div>
</Card>
