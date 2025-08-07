import type { PageServerLoad } from './$types';
import { SimplifiedDBClient } from '$lib/server/db/client';

export const load: PageServerLoad = async () => {
	const db = new SimplifiedDBClient();

	try {
		// Get available models from database
		const modelsQuery = `
			SELECT 
				id,
				name,
				description,
				pricing_prompt,
				pricing_completion,
				supports_tools,
				supports_vision,
				supports_json_output
			FROM models
			ORDER BY name
		`;
		const models = await db.all(modelsQuery);

		// Get benchmark templates
		const templatesQuery = `
			SELECT 
				id,
				name,
				description,
				benchmark_type,
				system_prompt,
				user_prompt,
				json_schema,
				tool_definitions
			FROM benchmark_templates
			ORDER BY created_at DESC
			LIMIT 10
		`;
		const templates = await db.all(templatesQuery);

		return {
			models: models.map(m => ({
				id: m.id,
				name: m.name,
				description: m.description || '',
				pricingPrompt: parseFloat(m.pricing_prompt || '0'),
				pricingCompletion: parseFloat(m.pricing_completion || '0'),
				supportsTools: m.supports_tools === 1,
				supportsVision: m.supports_vision === 1,
				supportsJsonOutput: m.supports_json_output === 1
			})),
			templates: templates.map(t => ({
				id: t.id,
				name: t.name,
				description: t.description || '',
				benchmarkType: t.benchmark_type,
				systemPrompt: t.system_prompt || '',
				userPrompt: t.user_prompt || '',
				jsonSchema: t.json_schema || '',
				toolDefinitions: t.tool_definitions || ''
			}))
		};
	} catch (error) {
		console.error('Error loading benchmark data:', error);
		// Return empty data on error
		return {
			models: [],
			templates: []
		};
	}
};