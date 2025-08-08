<script lang="ts">
	export let content: string;
	export let format: 'text' | 'json' | 'markdown' | 'code' = 'text';
	export let language = 'javascript';
	export let showCopy = true;
	export let showFullscreen = true;
	export let maxHeight = '500px';

	let copied = false;
	let fullscreen = false;
	let formattedContent = content;

	$: {
		if (format === 'json') {
			try {
				formattedContent = JSON.stringify(JSON.parse(content), null, 2);
			} catch {
				formattedContent = content;
			}
		} else {
			formattedContent = content;
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(content);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	function toggleFullscreen() {
		fullscreen = !fullscreen;
	}
</script>

<div
	class="relative overflow-hidden rounded-lg bg-slate-900"
	class:fixed={fullscreen}
	class:inset-4={fullscreen}
	class:z-50={fullscreen}
	style={!fullscreen ? `max-height: ${maxHeight}` : ''}
>
	<div
		class="sticky top-0 flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2"
	>
		<span class="font-mono text-xs text-slate-400">
			{format === 'json'
				? 'JSON'
				: format === 'markdown'
					? 'Markdown'
					: format === 'code'
						? language
						: 'Text'}
		</span>

		<div class="flex items-center gap-2">
			{#if showCopy}
				<button
					class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
					on:click={copyToClipboard}
					title="Copy to clipboard"
				>
					{#if copied}
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{:else}
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
					{/if}
				</button>
			{/if}

			{#if showFullscreen}
				<button
					class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
					on:click={toggleFullscreen}
					title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
				>
					{#if fullscreen}
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					{:else}
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
							/>
						</svg>
					{/if}
				</button>
			{/if}
		</div>
	</div>

	<div class="overflow-auto p-4">
		<pre class="font-mono text-sm whitespace-pre-wrap text-slate-200">{formattedContent}</pre>
	</div>
</div>
