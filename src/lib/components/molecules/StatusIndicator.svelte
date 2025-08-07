<script lang="ts">
	export let status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
	export let showLabel = true;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let animated = false;

	const statusConfig = {
		pending: {
			label: 'Pending',
			color: 'bg-slate-400',
			icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
		},
		running: {
			label: 'Running',
			color: 'bg-blue-500',
			icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>`
		},
		completed: {
			label: 'Completed',
			color: 'bg-green-500',
			icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
		},
		failed: {
			label: 'Failed',
			color: 'bg-red-500',
			icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
		},
		cancelled: {
			label: 'Cancelled',
			color: 'bg-amber-500',
			icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
		}
	};

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6'
	};

	const textSizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};

	$: config = statusConfig[status];
</script>

<div class="inline-flex items-center gap-2">
	<div class="relative">
		<div
			class="{sizeClasses[size]} {config.color} rounded-full"
			class:animate-pulse={animated && status === 'running'}
		></div>
		{#if status === 'running' && animated}
			<div
				class="{sizeClasses[
					size
				]} {config.color} absolute inset-0 animate-ping rounded-full opacity-75"
			></div>
		{/if}
	</div>

	{#if showLabel}
		<span class="{textSizeClasses[size]} font-medium text-slate-700 dark:text-slate-300">
			{config.label}
		</span>
	{/if}
</div>
