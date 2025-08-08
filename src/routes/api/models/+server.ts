import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOpenRouterClient } from '$lib/server/openrouter/client';
import { SimplifiedDBClient } from '$lib/server/db/client';
import type { Model } from '$lib/types/model';

export const GET: RequestHandler = async () => {
	try {
		const db = new SimplifiedDBClient();

		// First try to get models from database cache
		const cachedModels = await db.all(`
      SELECT 
        id,
        name,
        description,
        context_length as contextLength,
        pricing_prompt as pricingPrompt,
        pricing_completion as pricingCompletion,
        top_provider as topProvider,
        supports_tools as supportsTools,
        supports_vision as supportsVision,
        supports_json_output as supportsJsonOutput,
        updated_at
      FROM models
      WHERE updated_at > CURRENT_TIMESTAMP - INTERVAL '1 day'
      ORDER BY name
    `);

		if (cachedModels.length > 0) {
			const models: Model[] = cachedModels.map((m: unknown) => {
				const model = m as Record<string, unknown>;
				return {
					id: String(model.id || ''),
					name: String(model.name || ''),
					description: String(model.description || ''),
					contextLength: Number(model.contextLength || 0),
					pricing: {
						prompt: Number(model.pricingPrompt || 0),
						completion: Number(model.pricingCompletion || 0)
					},
					topProvider: model.topProvider ? String(model.topProvider) : null,
					supportsTools: Boolean(model.supportsTools),
					supportsVision: Boolean(model.supportsVision),
					supportsJsonOutput: Boolean(model.supportsJsonOutput)
				};
			});

			return json(models);
		}

		// If no cached models or cache is stale, fetch from OpenRouter
		const client = getOpenRouterClient();
		const openRouterModels = await client.getModels();

		// Update database cache
		const models: Model[] = [];

		for (const model of openRouterModels) {
			// Filter for models with pricing info
			if (model.pricing && model.id && model.name) {
				try {
					await db.run(
						`
            INSERT OR REPLACE INTO models (
              id, name, description, context_length,
              pricing_prompt, pricing_completion, top_provider,
              supports_tools, supports_vision, supports_json_output,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `,
						[
							model.id,
							model.name,
							model.description || null,
							model.context_length || 4096,
							model.pricing.prompt || 0,
							model.pricing.completion || 0,
							null, // top_provider is an object in OpenRouter, storing as null
							false,
							model.architecture?.modality === 'multimodal',
							false
						]
					);

					models.push({
						id: model.id,
						name: model.name,
						description: model.description || '',
						contextLength: model.context_length || 4096,
						pricing: {
							prompt: Number(model.pricing.prompt) || 0,
							completion: Number(model.pricing.completion) || 0
						},
						topProvider: null, // Changed from undefined
						supportsTools: false,
						supportsVision: model.architecture?.modality === 'multimodal' || false,
						supportsJsonOutput: false
					});
				} catch {
					// Skip failed insert
				}
			}
		}

		// Sort models by name for consistent display
		models.sort((a, b) => a.name.localeCompare(b.name));

		// Create clean array with explicit properties
		const cleanModels = models.map((m) => ({
			id: String(m.id),
			name: String(m.name),
			description: String(m.description || ''),
			contextLength: Number(m.contextLength),
			pricing: {
				prompt: Number(m.pricing.prompt),
				completion: Number(m.pricing.completion)
			},
			topProvider: m.topProvider,
			supportsTools: Boolean(m.supportsTools),
			supportsVision: Boolean(m.supportsVision),
			supportsJsonOutput: Boolean(m.supportsJsonOutput)
		}));

		return json(cleanModels);
	} catch {
		return json({ error: 'Failed to fetch models' }, { status: 500 });
	}
};
