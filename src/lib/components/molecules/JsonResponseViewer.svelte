<script lang="ts">
	export let response: string;
	export let schema: string | null = null;
	export let modelName: string = '';

	let isValidJson = false;
	let parsedJson: any = null;
	let schemaValidationErrors: string[] = [];

	$: {
		try {
			parsedJson = JSON.parse(response);
			isValidJson = true;

			// Check if it's an error response from our backend
			if (parsedJson.error && typeof parsedJson.error === 'string') {
				isValidJson = false;
				schemaValidationErrors = [parsedJson.error];
			} else if (schema) {
				validateAgainstSchema(parsedJson, schema);
			}
		} catch (e) {
			isValidJson = false;
			parsedJson = null;
			const error = e as Error;
			schemaValidationErrors = [`Response is not valid JSON: ${error.message}`];
		}
	}

	function validateAgainstSchema(data: any, schemaStr: string) {
		schemaValidationErrors = [];
		try {
			const schemaObj = JSON.parse(schemaStr);

			// Basic validation - check required fields
			if (schemaObj.required && Array.isArray(schemaObj.required)) {
				for (const field of schemaObj.required) {
					if (!(field in data)) {
						schemaValidationErrors.push(`Missing required field: ${field}`);
					}
				}
			}

			// Check for additional properties if not allowed
			if (schemaObj.additionalProperties === false && schemaObj.properties) {
				const allowedKeys = Object.keys(schemaObj.properties);
				const dataKeys = Object.keys(data);
				for (const key of dataKeys) {
					if (!allowedKeys.includes(key)) {
						schemaValidationErrors.push(`Unexpected property: ${key}`);
					}
				}
			}

			// Type checking for defined properties
			if (schemaObj.properties) {
				for (const [key, propSchema] of Object.entries(schemaObj.properties)) {
					if (key in data) {
						const value = data[key];
						const expectedType = (propSchema as any).type;
						const actualType = Array.isArray(value) ? 'array' : typeof value;

						if (expectedType && actualType !== expectedType) {
							if (
								!(expectedType === 'number' && actualType === 'number') &&
								!(
									expectedType === 'integer' &&
									typeof value === 'number' &&
									Number.isInteger(value)
								)
							) {
								schemaValidationErrors.push(
									`Property "${key}" should be ${expectedType} but is ${actualType}`
								);
							}
						}
					}
				}
			}
		} catch (e) {
			schemaValidationErrors.push('Invalid schema format');
		}
	}

	function formatJson(obj: any): string {
		return JSON.stringify(obj, null, 2);
	}
</script>

<div class="space-y-2">
	{#if modelName}
		<div class="text-sm font-medium text-slate-700 dark:text-slate-300">{modelName}</div>
	{/if}

	<div class="relative">
		{#if isValidJson && parsedJson}
			<div
				class="rounded-lg border bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800
				{schemaValidationErrors.length > 0 ? 'border-amber-400' : 'border-green-400'}"
			>
				<pre class="overflow-x-auto text-xs text-slate-800 dark:text-slate-200"><code
						>{formatJson(parsedJson)}</code
					></pre>
			</div>

			{#if schemaValidationErrors.length > 0}
				<div class="mt-2 rounded-lg bg-amber-50 p-2 text-xs dark:bg-amber-900/20">
					<div class="font-semibold text-amber-800 dark:text-amber-200">
						Schema Validation Issues:
					</div>
					<ul class="mt-1 list-inside list-disc text-amber-700 dark:text-amber-300">
						{#each schemaValidationErrors as error}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			{:else if schema}
				<div class="mt-2 text-xs text-green-600 dark:text-green-400">
					✓ Valid JSON matching schema
				</div>
			{/if}
		{:else}
			<div class="rounded-lg border border-red-400 bg-red-50 p-3 dark:bg-red-900/20">
				<pre class="overflow-x-auto text-xs text-red-800 dark:text-red-200"><code>{response}</code
					></pre>
			</div>
			{#if schemaValidationErrors.length > 0}
				<div class="mt-2 space-y-1">
					<div class="text-xs text-red-600 dark:text-red-400">✗ Invalid JSON response</div>
					{#each schemaValidationErrors as error}
						<div class="text-xs text-red-500 dark:text-red-300">{error}</div>
					{/each}
				</div>
			{:else}
				<div class="mt-2 text-xs text-red-600 dark:text-red-400">✗ Invalid JSON response</div>
			{/if}
		{/if}
	</div>
</div>
