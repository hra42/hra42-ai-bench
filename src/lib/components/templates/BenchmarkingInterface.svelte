<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../atoms/Button.svelte';
	import SimpleModelSelector from '../molecules/SimpleModelSelector.svelte';
	import BenchmarkConfigurator from '../organisms/BenchmarkConfigurator.svelte';
	import ModelComparisonGrid from '../organisms/ModelComparisonGrid.svelte';
	import CostBreakdown from '../organisms/CostBreakdown.svelte';
	import ExportDialog from '../molecules/ExportDialog.svelte';
	import { downloadFile, generateExportFilename, exportToCSV, exportToJSON, type ExportFormat } from '$lib/utils/export';

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
	export let runId: string | null = null;

	const dispatch = createEventDispatcher();
	
	let showExportDialog = false;
	let exportLoading = false;

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

	function handleExportClick() {
		showExportDialog = true;
	}

	async function handleExport(event: CustomEvent<{ format: ExportFormat }>) {
		const { format } = event.detail;
		exportLoading = true;

		try {
			// If we have a runId from the database, export from the API
			// Otherwise export the current session data
			if (runId) {
				// Export from the database
				const response = await fetch('/api/export', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						format,
						runId
					})
				});

				if (!response.ok) {
					throw new Error(`Export failed: ${response.statusText}`);
				}

				const blob = await response.blob();
				const filename = generateExportFilename(format, benchmarkName || 'benchmark');
				await downloadFile(blob, filename);
			} else {
				// Export current session data
				const exportData = {
					run: {
						id: runId || `session_${Date.now()}`,
						name: benchmarkName || 'Untitled Benchmark',
						benchmarkType,
						status: (isRunning ? 'running' : 'completed') as 'running' | 'completed',
						totalModels: selectedModels.length,
						completedModels: responses.filter(r => r.status === 'completed').length,
						systemPrompt,
						userPrompt: prompt,
						maxTokens,
						temperature,
						totalCost: costBreakdown.reduce((sum, m) => sum + m.totalCost, 0),
						startedAt: new Date(),
						completedAt: isRunning ? undefined : new Date(),
						createdAt: new Date()
					},
					responses: responses.map(r => ({
						id: `${r.modelId}_${Date.now()}`,
						runId: runId || `session_${Date.now()}`,
						modelId: r.modelId,
						modelName: r.modelName,
						status: r.status,
						responseText: r.response,
						responseJson: r.responseJson,
						toolCalls: r.toolCalls,
						errorMessage: r.error,
						promptTokens: r.inputTokens,
						completionTokens: r.outputTokens,
						totalTokens: (r.inputTokens || 0) + (r.outputTokens || 0),
						cost: r.cost,
						latencyMs: r.duration,
						openrouterLatencyMs: r.openRouterLatencyMs,
						generationTimeMs: r.generationTimeMs,
						tokensPerSecond: r.tokensPerSecond,
						startedAt: new Date(),
						completedAt: r.status === 'completed' ? new Date() : undefined,
						createdAt: new Date()
					})),
					metadata: {
						exportDate: new Date(),
						totalCost: costBreakdown.reduce((sum, m) => sum + m.totalCost, 0)
					}
				};

				let content: string;
				const filename = generateExportFilename(format, benchmarkName || 'benchmark');
				
				switch (format) {
					case 'csv':
						content = exportToCSV(exportData);
						await downloadFile(content, filename, 'text/csv');
						break;
					case 'json':
						content = exportToJSON(exportData);
						await downloadFile(content, filename, 'application/json');
						break;
				}
			}
			
			showExportDialog = false;
		} catch (error) {
			console.error('Export error:', error);
			dispatch('error', { error: 'Failed to export data' });
		} finally {
			exportLoading = false;
		}
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
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-xl font-semibold text-slate-900 dark:text-white">Results</h2>
							<Button variant="secondary" size="sm" on:click={handleExportClick}>
								Export Results
							</Button>
						</div>
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

<ExportDialog
	bind:isOpen={showExportDialog}
	loading={exportLoading}
	on:export={handleExport}
	on:close={() => showExportDialog = false}
/>
