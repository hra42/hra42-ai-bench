<script lang="ts">
	export let src: string | undefined = undefined;
	export let alt = '';
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let initials: string | undefined = undefined;

	const sizeClasses = {
		xs: 'w-6 h-6 text-xs',
		sm: 'w-8 h-8 text-sm',
		md: 'w-10 h-10 text-base',
		lg: 'w-12 h-12 text-lg',
		xl: 'w-16 h-16 text-xl'
	};
</script>

<div class="relative inline-block">
	{#if src}
		<img
			{src}
			{alt}
			class="{sizeClasses[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
		/>
	{:else}
		<div
			class="{sizeClasses[size]} flex items-center justify-center
             rounded-full bg-slate-200 font-medium text-slate-600 ring-2 ring-white
             dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-800"
		>
			{#if initials}
				{initials}
			{:else}
				<svg class="h-2/3 w-2/3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		</div>
	{/if}
</div>
