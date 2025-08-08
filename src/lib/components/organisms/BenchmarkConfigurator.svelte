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

	// Function calling examples
	const functionExamples = {
		weather: {
			name: 'Weather & Location',
			systemPrompt:
				'You are a helpful weather assistant. Use the available tools to provide accurate weather information.',
			userPrompt:
				"What's the weather like in Tokyo and New York? Also, how far apart are these cities?",
			tools: [
				{
					type: 'function',
					function: {
						name: 'get_weather',
						description: 'Get current weather conditions for a specific location',
						parameters: {
							type: 'object',
							properties: {
								location: {
									type: 'string',
									description: 'City name or coordinates'
								},
								units: {
									type: 'string',
									enum: ['celsius', 'fahrenheit'],
									description: 'Temperature unit preference',
									default: 'celsius'
								}
							},
							required: ['location']
						}
					}
				},
				{
					type: 'function',
					function: {
						name: 'calculate_distance',
						description: 'Calculate distance between two locations',
						parameters: {
							type: 'object',
							properties: {
								location1: {
									type: 'string',
									description: 'First location (city name or coordinates)'
								},
								location2: {
									type: 'string',
									description: 'Second location (city name or coordinates)'
								},
								unit: {
									type: 'string',
									enum: ['km', 'miles'],
									default: 'km'
								}
							},
							required: ['location1', 'location2']
						}
					}
				}
			]
		},
		database: {
			name: 'Database Operations',
			systemPrompt:
				'You are a database assistant. Use the provided tools to help users query and manage their data.',
			userPrompt:
				'Find all users who signed up last month and calculate the average age of premium subscribers.',
			tools: [
				{
					type: 'function',
					function: {
						name: 'query_database',
						description: 'Execute a database query to retrieve data',
						parameters: {
							type: 'object',
							properties: {
								table: {
									type: 'string',
									description: 'Database table name'
								},
								filters: {
									type: 'object',
									description: 'Query filters as key-value pairs'
								},
								fields: {
									type: 'array',
									items: { type: 'string' },
									description: 'Fields to retrieve'
								},
								limit: {
									type: 'integer',
									description: 'Maximum number of results',
									default: 100
								}
							},
							required: ['table']
						}
					}
				},
				{
					type: 'function',
					function: {
						name: 'calculate_statistics',
						description: 'Calculate statistical metrics on a dataset',
						parameters: {
							type: 'object',
							properties: {
								data: {
									type: 'array',
									description: 'Array of data points'
								},
								metric: {
									type: 'string',
									enum: ['mean', 'median', 'sum', 'count', 'std_dev'],
									description: 'Statistical metric to calculate'
								}
							},
							required: ['data', 'metric']
						}
					}
				}
			]
		},
		math: {
			name: 'Math & Calculations',
			systemPrompt:
				'You are a mathematical assistant. Use the calculation tools to solve problems accurately.',
			userPrompt:
				'Calculate the compound interest on $10,000 invested at 5% annual rate for 10 years, then convert the final amount to euros.',
			tools: [
				{
					type: 'function',
					function: {
						name: 'calculate_compound_interest',
						description: 'Calculate compound interest on an investment',
						parameters: {
							type: 'object',
							properties: {
								principal: {
									type: 'number',
									description: 'Initial investment amount'
								},
								rate: {
									type: 'number',
									description: 'Annual interest rate (as decimal, e.g., 0.05 for 5%)'
								},
								time: {
									type: 'number',
									description: 'Investment period in years'
								},
								compounds_per_year: {
									type: 'integer',
									description: 'Number of times interest compounds per year',
									default: 1
								}
							},
							required: ['principal', 'rate', 'time']
						}
					}
				},
				{
					type: 'function',
					function: {
						name: 'convert_currency',
						description: 'Convert between different currencies',
						parameters: {
							type: 'object',
							properties: {
								amount: {
									type: 'number',
									description: 'Amount to convert'
								},
								from_currency: {
									type: 'string',
									description: 'Source currency code (e.g., USD)'
								},
								to_currency: {
									type: 'string',
									description: 'Target currency code (e.g., EUR)'
								}
							},
							required: ['amount', 'from_currency', 'to_currency']
						}
					}
				}
			]
		},
		ecommerce: {
			name: 'E-commerce & Shopping',
			systemPrompt:
				'You are a shopping assistant. Help users find products and manage their orders.',
			userPrompt:
				'Find wireless headphones under $200, check if the top result is in stock, and add it to my cart.',
			tools: [
				{
					type: 'function',
					function: {
						name: 'search_products',
						description: 'Search for products in the catalog',
						parameters: {
							type: 'object',
							properties: {
								query: {
									type: 'string',
									description: 'Search query'
								},
								category: {
									type: 'string',
									description: 'Product category filter'
								},
								max_price: {
									type: 'number',
									description: 'Maximum price filter'
								},
								min_price: {
									type: 'number',
									description: 'Minimum price filter'
								},
								sort_by: {
									type: 'string',
									enum: ['price_asc', 'price_desc', 'rating', 'relevance'],
									default: 'relevance'
								}
							},
							required: ['query']
						}
					}
				},
				{
					type: 'function',
					function: {
						name: 'check_inventory',
						description: 'Check product availability in inventory',
						parameters: {
							type: 'object',
							properties: {
								product_id: {
									type: 'string',
									description: 'Product identifier'
								},
								location: {
									type: 'string',
									description: 'Store location or warehouse'
								}
							},
							required: ['product_id']
						}
					}
				},
				{
					type: 'function',
					function: {
						name: 'add_to_cart',
						description: 'Add a product to the shopping cart',
						parameters: {
							type: 'object',
							properties: {
								product_id: {
									type: 'string',
									description: 'Product identifier'
								},
								quantity: {
									type: 'integer',
									description: 'Number of items to add',
									default: 1
								}
							},
							required: ['product_id']
						}
					}
				}
			]
		}
	};

	let selectedFunctionExample = 'weather';

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

	// Validate function definitions when they change
	$: validateFunctionDefinitions(functionDefinitions);

	let jsonSchemaError = '';
	let functionDefinitionsError = '';

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

	function validateFunctionDefinitions(defs: string) {
		if (!defs || defs.trim() === '') {
			functionDefinitionsError = '';
			return;
		}

		try {
			const parsed = JSON.parse(defs);
			if (!Array.isArray(parsed)) {
				functionDefinitionsError = 'Tools must be an array';
				return;
			}

			for (let i = 0; i < parsed.length; i++) {
				const tool = parsed[i];
				if (!tool.type || tool.type !== 'function') {
					functionDefinitionsError = `Tool ${i + 1}: type must be "function"`;
					return;
				}
				if (!tool.function) {
					functionDefinitionsError = `Tool ${i + 1}: missing function definition`;
					return;
				}
				if (!tool.function.name) {
					functionDefinitionsError = `Tool ${i + 1}: function must have a name`;
					return;
				}
				if (tool.function.parameters && typeof tool.function.parameters !== 'object') {
					functionDefinitionsError = `Tool ${i + 1}: parameters must be an object`;
					return;
				}
			}
			functionDefinitionsError = '';
		} catch (e) {
			functionDefinitionsError = 'Invalid JSON syntax';
		}
	}

	function loadFunctionExample() {
		const example = functionExamples[selectedFunctionExample as keyof typeof functionExamples];
		if (example) {
			systemPrompt = example.systemPrompt;
			prompt = example.userPrompt;
			functionDefinitions = JSON.stringify(example.tools, null, 2);
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
				<div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<p class="text-sm font-medium text-blue-900 dark:text-blue-100">
								Load a function calling example
							</p>
							<p class="mt-1 text-xs text-blue-800 dark:text-blue-200">
								Choose an example scenario to test how models handle function/tool calling
							</p>
						</div>
						<div class="flex items-center gap-2">
							<select
								bind:value={selectedFunctionExample}
								class="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-blue-700 dark:bg-slate-800 dark:text-slate-200"
							>
								{#each Object.entries(functionExamples) as [key, example]}
									<option value={key}>{example.name}</option>
								{/each}
							</select>
							<button
								type="button"
								on:click={loadFunctionExample}
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
						placeholder="Enter your prompt that will require the model to use the available tools..."
					/>
				</div>
				<div>
					<div class="mb-2 flex items-center justify-between">
						<label
							for="function-defs"
							class="text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Tool Definitions (OpenAI Format)
						</label>
						{#if functionDefinitions}
							<span class="text-xs text-slate-500 dark:text-slate-400">
								{(() => {
									try {
										const tools = JSON.parse(functionDefinitions);
										return `${tools.length} tool${tools.length !== 1 ? 's' : ''} defined`;
									} catch {
										return '';
									}
								})()}
							</span>
						{/if}
					</div>
					<textarea
						id="function-defs"
						bind:value={functionDefinitions}
						class="w-full rounded-lg border font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none
							{functionDefinitionsError
							? 'border-red-500 bg-red-50 text-red-900 dark:border-red-400 dark:bg-red-900/20 dark:text-red-100'
							: 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white'} px-3 py-2"
						rows="12"
						placeholder={'[\n  {\n    "type": "function",\n    "function": {\n      "name": "tool_name",\n      "description": "What this tool does",\n      "parameters": {\n        "type": "object",\n        "properties": {...},\n        "required": [...]\n      }\n    }\n  }\n]'}
					></textarea>
					{#if functionDefinitionsError}
						<p class="mt-1 text-xs text-red-600 dark:text-red-400">{functionDefinitionsError}</p>
					{:else if functionDefinitions}
						<p class="mt-1 text-xs text-green-600 dark:text-green-400">✓ Valid tool definitions</p>
					{/if}
					<div
						class="mt-2 space-y-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
					>
						<div>
							<strong>Note:</strong> Function calling allows models to request external tool usage. The
							model won't execute tools directly but will return structured requests indicating which
							tools to call with what parameters.
						</div>
						<div>
							<strong>Compatible Models:</strong> Most modern models support function calling
							including GPT-4, GPT-3.5, Claude 3+, Gemini, and many open-source models. Check
							<a
								href="https://openrouter.ai/models?supported_parameters=tools"
								target="_blank"
								class="underline"
							>
								supported models
							</a> for the full list.
						</div>
						<div>
							<strong>Response Format:</strong> Models will return tool_calls with function names and
							arguments that match your defined tools. The actual tool execution would happen on your
							side in a real application.
						</div>
					</div>
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
