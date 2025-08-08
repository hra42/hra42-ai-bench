<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../atoms/Button.svelte';
	import SimpleModelSelector from '../molecules/SimpleModelSelector.svelte';
	import BenchmarkConfigurator from '../organisms/BenchmarkConfigurator.svelte';
	import ModelComparisonGrid from '../organisms/ModelComparisonGrid.svelte';
	import CostBreakdown from '../organisms/CostBreakdown.svelte';

	export let availableModels: Array<{ id: string; name: string; provider: string }> = [];
	export let selectedModels: string[] = [];
	export let benchmarkName = '';
	export let benchmarkType: 'text' | 'structured' | 'tool' | 'vision' | 'document' = 'text';
	export let systemPrompt = '';
	export let prompt = '';
	export let temperature = 0.7;
	export let maxTokens = 2048;
	export let files: File[] = [];
	export let jsonSchema = '';
	export let functionDefinitions = '';
	export let responses: Array<{
		modelId: string;
		modelName: string;
		provider: string;
		status: 'pending' | 'running' | 'completed' | 'failed';
		response?: string;
		responseJson?: string;
		toolCalls?: string;
		error?: string;
		duration?: number;
		cost?: number;
		inputTokens?: number;
		outputTokens?: number;
		timeToFirstTokenMs?: number;
		openRouterLatencyMs?: number;
		generationTimeMs?: number;
		moderationLatencyMs?: number;
		tokensPerSecond?: number;
	}> = [];
	export let costBreakdown: Array<{
		name: string;
		inputCost: number;
		outputCost: number;
		totalCost: number;
		inputTokens: number;
		outputTokens: number;
	}> = [];
	export let isRunning = false;

	const dispatch = createEventDispatcher();

	function handleExecute() {
		dispatch('execute', {
			benchmarkName,
			benchmarkType,
			systemPrompt,
			prompt,
			temperature,
			maxTokens,
			files,
			jsonSchema,
			functionDefinitions,
			selectedModels
		});
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="space-y-8">
			<div>
				<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Benchmark LLMs</h1>
				<p class="mt-2 text-slate-600 dark:text-slate-400">
					Compare multiple language models side by side
				</p>
			</div>

			<div
				class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="space-y-6">
					<div>
						<h2 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Select Models</h2>
						<SimpleModelSelector models={availableModels} bind:selected={selectedModels} />
					</div>

					<div class="border-t border-slate-200 pt-6 dark:border-slate-700">
						<BenchmarkConfigurator
							bind:benchmarkName
							bind:benchmarkType
							bind:systemPrompt
							bind:prompt
							bind:temperature
							bind:maxTokens
							bind:files
							bind:jsonSchema
							bind:functionDefinitions
							on:error
						/>
					</div>

					<div class="flex items-center justify-between border-t border-slate-200 pt-6">
						<div class="text-sm text-slate-500">
							{selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
						</div>

						<div class="flex items-center gap-3">
							{#if isRunning}
								<Button variant="secondary" on:click={handleCancel}>Cancel</Button>
							{/if}

							<Button
								variant="primary"
								size="lg"
								loading={isRunning}
								disabled={selectedModels.length === 0 || (!prompt && files.length === 0)}
								on:click={handleExecute}
							>
								{isRunning ? 'Running Benchmark...' : 'Execute Benchmark'}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{#if responses.length > 0}
				<div class="space-y-6">
					<div>
						<h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Results</h2>
						<ModelComparisonGrid {responses} {benchmarkType} {jsonSchema} />
					</div>

					{#if costBreakdown.length > 0}
						<CostBreakdown models={costBreakdown} />
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
