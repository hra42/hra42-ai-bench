import type { PageServerLoad } from './$types';
import { SimplifiedDBClient } from '$lib/server/db/client';
import { getOpenRouterClient } from '$lib/server/openrouter/client';

export const load: PageServerLoad = async () => {
	try {
		// Always fetch fresh models from OpenRouter for now
		const client = getOpenRouterClient();
		const openRouterModels = await client.getModels();

		// Filter and transform models
		const models = openRouterModels
			.filter((model) => model.pricing && model.id && model.name)
			.map((model) => ({
				id: model.id,
				name: model.name,
				description: model.description || '',
				pricing_prompt: model.pricing?.prompt || 0,
				pricing_completion: model.pricing?.completion || 0,
				supports_tools: false,
				supports_vision: model.architecture?.modality === 'multimodal' || false,
				supports_json_output: false
			}));

		// Get benchmark templates (keeping this as-is for now)
		const db = new SimplifiedDBClient();
		const templates = await db.all(`
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
		`);

		const result = {
			models: models.map((m: any) => ({
				id: String(m.id),
				name: String(m.name),
				description: String(m.description || ''),
				pricingPrompt: Number(m.pricing_prompt || 0),
				pricingCompletion: Number(m.pricing_completion || 0),
				supportsTools: Boolean(m.supports_tools),
				supportsVision: Boolean(m.supports_vision),
				supportsJsonOutput: Boolean(m.supports_json_output)
			})),
			templates: templates.map((t: any) => ({
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

		return result;
	} catch (error) {
		console.error('Error loading benchmark data:', error);
		// Return empty data on error
		return {
			models: [],
			templates: []
		};
	}
};
