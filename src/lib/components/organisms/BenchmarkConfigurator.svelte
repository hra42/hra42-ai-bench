<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Card from '../atoms/Card.svelte';
	import Input from '../atoms/Input.svelte';
	import PromptInput from '../molecules/PromptInput.svelte';
	import FileUploader from '../molecules/FileUploader.svelte';

	export let benchmarkName = '';
	export let benchmarkType: 'text' | 'structured' | 'tool' | 'vision' | 'document' = 'text';
	export let systemPrompt = '';
	export let prompt = '';
	export let temperature = 0.7;
	export let maxTokens = 2048;
	export let files: File[] = [];
	export let jsonSchema = '';
	export let functionDefinitions = '';

	const dispatch = createEventDispatcher();

	type BenchmarkTypeKey = 'text' | 'structured' | 'tool' | 'vision' | 'document';

	const benchmarkTypeConfig: Record<
		BenchmarkTypeKey,
		{ label: string; icon: string; description: string }
	> = {
		text: {
			label: 'Text Generation',
			icon: '📝',
			description: 'Simple prompt/response comparison'
		},
		structured: {
			label: 'Structured Output',
			icon: '📊',
			description: 'JSON schema compliance testing'
		},
		tool: {
			label: 'Tool/Function Calling',
			icon: '🔧',
			description: 'Function definition and execution'
		},
		vision: {
			label: 'Vision Analysis',
			icon: '👁️',
			description: 'Image understanding capabilities'
		},
		document: {
			label: 'Document Processing',
			icon: '📄',
			description: 'PDF text extraction and analysis'
		}
	};

	function selectBenchmarkType(type: typeof benchmarkType) {
		benchmarkType = type;
		dispatch('typeChange', { type });
	}
</script>

<div class="space-y-6">
	<div>
		<h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Select Benchmark Type</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
			{#each Object.entries(benchmarkTypeConfig) as [type, config] (type)}
				<button
					class="rounded-lg border-2 p-4 text-left transition-all
						{benchmarkType === type
						? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
						: 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'}"
					on:click={() => selectBenchmarkType(type as BenchmarkTypeKey)}
				>
					<div class="mb-2 text-2xl">{config.icon}</div>
					<div class="font-medium text-slate-900 dark:text-white">{config.label}</div>
					<div class="mt-1 text-xs text-slate-500 dark:text-slate-400">{config.description}</div>
				</button>
			{/each}
		</div>
	</div>

	<Card>
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-slate-900 dark:text-white">Configure Benchmark</h3>

			<!-- Common configuration fields -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div>
					<Input
						label="Benchmark Name"
						bind:value={benchmarkName}
						placeholder="e.g., GPT-4 vs Claude Comparison"
						hint="Give your benchmark a descriptive name"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label
							for="temperature"
							class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Temperature
						</label>
						<input
							id="temperature"
							type="number"
							bind:value={temperature}
							min="0"
							max="2"
							step="0.1"
							class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
						/>
					</div>
					<div>
						<label
							for="maxTokens"
							class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Max Tokens
						</label>
						<input
							id="maxTokens"
							type="number"
							bind:value={maxTokens}
							min="1"
							max="32000"
							step="100"
							class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
						/>
					</div>
				</div>
			</div>

			<div>
				<div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">System Prompt</div>
				<PromptInput
					bind:value={systemPrompt}
					placeholder="Enter system instructions (optional)..."
					rows={3}
				/>
			</div>

			{#if benchmarkType === 'text'}
				<div>
					<div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">User Prompt</div>
					<PromptInput bind:value={prompt} placeholder="Enter your prompt for the models..." />
				</div>
			{/if}

			{#if benchmarkType === 'structured'}
				<div>
					<div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">User Prompt</div>
					<PromptInput
						bind:value={prompt}
						placeholder="Enter your prompt for structured output..."
					/>
				</div>
				<div>
					<label
						for="json-schema"
						class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
						>JSON Schema</label
					>
					<textarea
						id="json-schema"
						bind:value={jsonSchema}
						class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
						rows="8"
						placeholder={'{"type": "object", "properties": { ... }}'}
					></textarea>
				</div>
			{/if}

			{#if benchmarkType === 'tool'}
				<div>
					<div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">User Prompt</div>
					<PromptInput
						bind:value={prompt}
						placeholder="Enter your prompt for function calling..."
					/>
				</div>
				<div>
					<label
						for="function-defs"
						class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
						>Function Definitions</label
					>
					<textarea
						id="function-defs"
						bind:value={functionDefinitions}
						class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
						rows="8"
						placeholder={'[{"name": "function_name", "parameters": {...}}]'}
					></textarea>
				</div>
			{/if}

			{#if benchmarkType === 'vision'}
				<div>
					<div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
						Upload Image
					</div>
					<FileUploader
						bind:files
						accept="image/jpeg,image/png,image/webp"
						maxSize={20 * 1024 * 1024}
						on:error={(e) => dispatch('error', e.detail)}
					/>
				</div>
				<div>
					<div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
						Analysis Prompt
					</div>
					<PromptInput
						bind:value={prompt}
						placeholder="What would you like to analyze about this image?"
					/>
				</div>
			{/if}

			{#if benchmarkType === 'document'}
				<div>
					<div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
						Upload Document
					</div>
					<FileUploader
						bind:files
						accept=".pdf"
						maxSize={50 * 1024 * 1024}
						on:error={(e) => dispatch('error', e.detail)}
					/>
				</div>
				<div>
					<div class="mb-2 text-sm font-medium text-slate-700">Processing Instructions</div>
					<PromptInput
						bind:value={prompt}
						placeholder="What would you like to extract or analyze from this document?"
					/>
				</div>
			{/if}
		</div>
	</Card>
</div>
