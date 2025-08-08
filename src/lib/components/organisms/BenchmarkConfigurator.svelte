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

	// Default JSON schema example for structured output
	const jsonSchemaExample = JSON.stringify(
		{
			type: 'object',
			properties: {
				name: {
					type: 'string',
					description: 'The name of the person'
				},
				age: {
					type: 'number',
					description: 'The age of the person'
				},
				email: {
					type: 'string',
					description: 'Email address'
				},
				skills: {
					type: 'array',
					items: {
						type: 'string'
					},
					description: 'List of skills'
				}
			},
			required: ['name', 'age', 'email', 'skills'],
			additionalProperties: false
		},
		null,
		2
	);

	// Example prompts for structured output
	const exampleSystemPrompt =
		'You are a helpful assistant that extracts structured information from text. Always respond with valid JSON that matches the provided schema.';
	const exampleUserPrompt =
		'Extract the person information from this text: John Doe is a 28-year-old software engineer. His email is john.doe@example.com. He is skilled in Python, JavaScript, and Docker.';

	// Additional example schemas
	const exampleSchemas = {
		person: {
			schema: jsonSchemaExample,
			systemPrompt: exampleSystemPrompt,
			userPrompt: exampleUserPrompt,
			name: 'Person Information'
		},
		product: {
			schema: JSON.stringify(
				{
					type: 'object',
					properties: {
						name: { type: 'string', description: 'Product name' },
						price: { type: 'number', description: 'Price in USD' },
						category: { type: 'string', description: 'Product category' },
						inStock: { type: 'boolean', description: 'Availability status' },
						features: {
							type: 'array',
							items: { type: 'string' },
							description: 'List of product features'
						}
					},
					required: ['name', 'price', 'category', 'inStock', 'features'],
					additionalProperties: false
				},
				null,
				2
			),
			systemPrompt:
				'You are a product information extractor. Extract product details and return them as structured JSON.',
			userPrompt:
				"Extract product info: The new iPhone 15 Pro costs $999 and is in the Electronics category. It's currently in stock and features a titanium design, A17 Pro chip, and USB-C port.",
			name: 'Product Details'
		},
		sentiment: {
			schema: JSON.stringify(
				{
					type: 'object',
					properties: {
						sentiment: {
							type: 'string',
							enum: ['positive', 'negative', 'neutral'],
							description: 'Overall sentiment'
						},
						confidence: {
							type: 'number',
							minimum: 0,
							maximum: 1,
							description: 'Confidence score'
						},
						aspects: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									aspect: { type: 'string' },
									sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] }
								},
								required: ['aspect', 'sentiment'],
								additionalProperties: false
							},
							description: 'Aspect-based sentiment analysis'
						},
						summary: { type: 'string', description: 'Brief summary of the analysis' }
					},
					required: ['sentiment', 'confidence', 'aspects', 'summary'],
					additionalProperties: false
				},
				null,
				2
			),
			systemPrompt:
				'You are a sentiment analysis system. Analyze the given text and return structured sentiment data.',
			userPrompt:
				'Analyze this review: "The product quality is excellent and shipping was fast. However, customer service was unhelpful when I had questions. Overall, I\'m satisfied with my purchase."',
			name: 'Sentiment Analysis'
		}
	};

	let selectedExample = 'person';

	// Validate JSON schema when it changes
	$: validateJsonSchema(jsonSchema);

	let jsonSchemaError = '';

	function validateJsonSchema(schema: string) {
		if (!schema || schema.trim() === '') {
			jsonSchemaError = '';
			return;
		}

		try {
			const parsed = JSON.parse(schema);
			if (typeof parsed !== 'object' || parsed === null) {
				jsonSchemaError = 'Schema must be a valid JSON object';
			} else if (!parsed.type) {
				jsonSchemaError = 'Schema must have a "type" property';
			} else {
				jsonSchemaError = '';
			}
		} catch (e) {
			jsonSchemaError = 'Invalid JSON syntax';
		}
	}

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

	function loadStructuredExample() {
		const example = exampleSchemas[selectedExample as keyof typeof exampleSchemas];
		if (example) {
			jsonSchema = example.schema;
			systemPrompt = example.systemPrompt;
			prompt = example.userPrompt;
		}
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
				<div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<p class="text-sm font-medium text-blue-900 dark:text-blue-100">
								Need an example to get started?
							</p>
							<p class="mt-1 text-xs text-blue-800 dark:text-blue-200">
								Choose an example type and load a complete working example with schema and prompts
							</p>
						</div>
						<div class="flex items-center gap-2">
							<select
								bind:value={selectedExample}
								class="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-blue-700 dark:bg-slate-800 dark:text-slate-200"
							>
								{#each Object.entries(exampleSchemas) as [key, example]}
									<option value={key}>{example.name}</option>
								{/each}
							</select>
							<button
								type="button"
								on:click={loadStructuredExample}
								class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
							>
								Load Example
							</button>
						</div>
					</div>
				</div>

				<div>
					<div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">User Prompt</div>
					<PromptInput
						bind:value={prompt}
						placeholder="Enter your prompt for structured output..."
					/>
				</div>
				<div>
					<div class="mb-2 flex items-center justify-between">
						<label for="json-schema" class="text-sm font-medium text-slate-700 dark:text-slate-300">
							JSON Schema
						</label>
						<button
							type="button"
							on:click={() => (jsonSchema = jsonSchemaExample)}
							class="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Load Schema Only
						</button>
					</div>
					<textarea
						id="json-schema"
						bind:value={jsonSchema}
						class="w-full rounded-lg border font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none
							{jsonSchemaError
							? 'border-red-500 bg-red-50 text-red-900 dark:border-red-400 dark:bg-red-900/20 dark:text-red-100'
							: 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white'} px-3 py-2"
						rows="10"
						placeholder={'{\n  "type": "object",\n  "properties": {\n    ...\n  }\n}'}
					></textarea>
					{#if jsonSchemaError}
						<p class="mt-1 text-xs text-red-600 dark:text-red-400">{jsonSchemaError}</p>
					{:else if jsonSchema}
						<p class="mt-1 text-xs text-green-600 dark:text-green-400">✓ Valid JSON Schema</p>
					{/if}
					<div
						class="mt-2 space-y-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
					>
						<div>
							<strong>Note:</strong> The JSON Schema will be enforced by compatible models to ensure
							structured responses. Not all models support structured outputs - check model capabilities
							before testing.
						</div>
						<div>
							<strong>Compatible Models:</strong> OpenAI GPT-4/GPT-3.5, Claude 3+, and most recent models.
							Some older or specialized models may not support structured outputs.
						</div>
						<div>
							<strong>Important:</strong> OpenAI models require ALL properties to be listed in the "required"
							array. Make sure your schema includes all defined properties in the required field.
						</div>
					</div>
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
