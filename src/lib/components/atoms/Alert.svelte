<script lang="ts">
	export let variant: 'info' | 'success' | 'warning' | 'error' = 'info';
	export let title: string | undefined = undefined;
	export let dismissible = false;

	let dismissed = false;

	const variantConfig = {
		info: {
			bg: 'bg-blue-50',
			border: 'border-blue-200',
			text: 'text-blue-900',
			icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
		},
		success: {
			bg: 'bg-green-50',
			border: 'border-green-200',
			text: 'text-green-900',
			icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
		},
		warning: {
			bg: 'bg-amber-50',
			border: 'border-amber-200',
			text: 'text-amber-900',
			icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>`
		},
		error: {
			bg: 'bg-red-50',
			border: 'border-red-200',
			text: 'text-red-900',
			icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
		}
	};

	$: config = variantConfig[variant];

	function dismiss() {
		dismissed = true;
	}
</script>

{#if !dismissed}
	<div class="rounded-lg border p-4 {config.bg} {config.border}">
		<div class="flex">
			<div class="flex-shrink-0">
				<div class="h-5 w-5 {config.text}">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html config.icon}
				</div>
			</div>
			<div class="ml-3 flex-1">
				{#if title}
					<h3 class="text-sm font-medium {config.text}">{title}</h3>
				{/if}
				<div class="text-sm {title ? 'mt-1' : ''} {config.text}">
					<slot />
				</div>
			</div>
			{#if dismissible}
				<button
					type="button"
					class="ml-3 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md {config.text} hover:opacity-75 focus:ring-2 focus:ring-offset-2 focus:outline-none"
					on:click={dismiss}
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
{/if}
