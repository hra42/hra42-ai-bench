<script lang="ts">
	export let toolCalls: string | null = null;
	export let compact = false;

	interface ToolCall {
		id: string;
		type: 'function';
		function: {
			name: string;
			arguments: string;
		};
	}

	let parsedToolCalls: ToolCall[] = [];
	let parseError = false;

	$: {
		if (toolCalls) {
			try {
				parsedToolCalls = JSON.parse(toolCalls);
				parseError = false;
			} catch (e) {
				parsedToolCalls = [];
				parseError = true;
			}
		} else {
			parsedToolCalls = [];
			parseError = false;
		}
	}

	function formatArguments(args: string): string {
		try {
			const parsed = JSON.parse(args);
			return JSON.stringify(parsed, null, 2);
		} catch {
			return args;
		}
	}

	function getArgumentsSummary(args: string): string {
		try {
			const parsed = JSON.parse(args);
			const keys = Object.keys(parsed);
			if (keys.length === 0) return 'No arguments';
			if (keys.length <= 3) {
				return keys.map((k) => `${k}: ${JSON.stringify(parsed[k])}`).join(', ');
			}
			return `${keys.length} arguments`;
		} catch {
			return 'Invalid arguments';
		}
	}
</script>

{#if !toolCalls}
	<div class="text-sm text-slate-500 dark:text-slate-400">No function calls were made</div>
{:else if parseError}
	<div class="text-sm text-red-600 dark:text-red-400">Failed to parse tool calls response</div>
{:else if parsedToolCalls.length === 0}
	<div class="text-sm text-slate-500 dark:text-slate-400">No function calls were made</div>
{:else if compact}
	<div class="space-y-1">
		{#each parsedToolCalls as call}
			<div class="flex items-center gap-2 text-sm">
				<span
					class="rounded bg-blue-100 px-2 py-0.5 font-mono text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
				>
					{call.function.name}
				</span>
				<span class="text-slate-600 dark:text-slate-400">
					{getArgumentsSummary(call.function.arguments)}
				</span>
			</div>
		{/each}
	</div>
{:else}
	<div class="space-y-3">
		{#each parsedToolCalls as call, i}
			<div
				class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
			>
				<div class="mb-2 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="text-xs font-medium text-slate-500 dark:text-slate-400">
							Call #{i + 1}
						</span>
						<span
							class="rounded bg-blue-100 px-2 py-0.5 font-mono text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
						>
							{call.function.name}
						</span>
					</div>
					{#if call.id}
						<span class="font-mono text-xs text-slate-400 dark:text-slate-500">
							ID: {call.id.slice(0, 8)}...
						</span>
					{/if}
				</div>
				<div class="mt-2">
					<div class="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">Arguments:</div>
					<pre
						class="overflow-x-auto rounded bg-white p-2 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">{formatArguments(
							call.function.arguments
						)}</pre>
				</div>
			</div>
		{/each}
		<div
			class="rounded bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
		>
			<strong>Note:</strong> These are function call requests from the model. In a real application,
			these functions would be executed and their results would be sent back to the model for further
			processing.
		</div>
	</div>
{/if}
