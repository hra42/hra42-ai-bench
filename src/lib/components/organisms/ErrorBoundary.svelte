<script lang="ts">
	import { onMount } from 'svelte';
	import Alert from '../atoms/Alert.svelte';
	import Button from '../atoms/Button.svelte';

	export let error: Error | null = null;
	export let resetError: (() => void) | undefined = undefined;
	export let showDetails = false;

	onMount(() => {
		const handleError = (event: ErrorEvent) => {
			error = new Error(event.message);
			event.preventDefault();
		};

		window.addEventListener('error', handleError);

		return () => {
			window.removeEventListener('error', handleError);
		};
	});

	function toggleDetails() {
		showDetails = !showDetails;
	}

	function handleReset() {
		error = null;
		showDetails = false;
		if (resetError) {
			resetError();
		}
	}
</script>

{#if error}
	<div class="flex min-h-[400px] items-center justify-center p-8">
		<div class="w-full max-w-md">
			<Alert variant="error" title="Something went wrong">
				<p class="mb-4">{error.message || 'An unexpected error occurred'}</p>

				{#if showDetails && error.stack}
					<div class="mt-4 rounded-md bg-red-100 p-3">
						<pre class="font-mono text-xs whitespace-pre-wrap text-red-800">{error.stack}</pre>
					</div>
				{/if}

				<div class="mt-4 flex items-center gap-3">
					{#if resetError}
						<Button variant="primary" size="sm" on:click={handleReset}>Try Again</Button>
					{/if}

					{#if error.stack}
						<Button variant="ghost" size="sm" on:click={toggleDetails}>
							{showDetails ? 'Hide' : 'Show'} Details
						</Button>
					{/if}
				</div>
			</Alert>
		</div>
	</div>
{:else}
	<slot />
{/if}
