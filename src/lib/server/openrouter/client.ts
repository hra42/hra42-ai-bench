import { env } from '$env/dynamic/private';
import type { OpenRouterModel, OpenRouterChatRequest, OpenRouterChatResponse } from './types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

class OpenRouterClient {
	private apiKey: string;
	private baseUrl: string;

	constructor(apiKey: string = env.OPENROUTER_API_KEY, baseUrl: string = OPENROUTER_BASE_URL) {
		if (!apiKey) {
			throw new Error('OpenRouter API key is required');
		}
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
	}

	private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await fetch(url, {
			...options,
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': 'https://hra42-bench.ai',
				'X-Title': 'HRA42 AI Benchmark',
				...options?.headers
			}
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
		}

		return response.json();
	}

	async getModels(): Promise<OpenRouterModel[]> {
		const response = await this.request<{ data: OpenRouterModel[] }>('/models');
		return response.data;
	}

	async chat(request: OpenRouterChatRequest): Promise<OpenRouterChatResponse> {
		return this.request<OpenRouterChatResponse>('/chat/completions', {
			method: 'POST',
			body: JSON.stringify({
				...request,
				// Ensure usage is always requested if not explicitly set
				usage: request.usage || { include: true }
			})
		});
	}

	async chatStream(request: OpenRouterChatRequest): Promise<ReadableStream> {
		const url = `${this.baseUrl}/chat/completions`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': 'https://hra42-bench.ai',
				'X-Title': 'HRA42 AI Benchmark'
			},
			body: JSON.stringify({
				...request,
				stream: true,
				usage: { include: true } // Request usage information in the stream
			})
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
		}

		return response.body!;
	}

	async getModelDetails(modelId: string): Promise<OpenRouterModel> {
		// First try to get from database cache
		const { SimplifiedDBClient } = await import('$lib/server/db/client');
		const db = new SimplifiedDBClient();

		const cached = await db.all(`SELECT * FROM models WHERE id = ? LIMIT 1`, [modelId]);

		if (cached.length > 0) {
			const model = cached[0] as any;
			return {
				id: model.id,
				name: model.name,
				description: model.description,
				pricing: {
					prompt: Number(model.pricing_prompt) || 0,
					completion: Number(model.pricing_completion) || 0
				},
				context_length: model.context_length,
				architecture: model.architecture ? JSON.parse(model.architecture) : undefined,
				top_provider: model.top_provider ? JSON.parse(model.top_provider) : undefined,
				per_request_limits: model.per_request_limits
					? JSON.parse(model.per_request_limits)
					: undefined
			};
		}

		// Fallback to API if not in cache
		const models = await this.getModels();
		const model = models.find((m) => m.id === modelId);

		if (!model) {
			throw new Error(`Model ${modelId} not found`);
		}

		return model;
	}

	async getGeneration(generationId: string): Promise<{
		latency?: number;
		generation_time?: number;
		moderation_latency?: number;
	}> {
		const url = `${this.baseUrl}/generation?id=${generationId}`;

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${this.apiKey}`
			}
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Failed to get generation details: ${response.status} - ${error}`);
		}

		const result = await response.json();
		return result.data;
	}

	calculateCost(model: OpenRouterModel, promptTokens: number, completionTokens: number): number {
		// Handle pricing that might be strings from API
		// OpenRouter pricing is in dollars per token (e.g., 0.0000008 = $0.80 per million)
		const promptPrice =
			typeof model.pricing?.prompt === 'string'
				? parseFloat(model.pricing.prompt)
				: model.pricing?.prompt || 0;
		const completionPrice =
			typeof model.pricing?.completion === 'string'
				? parseFloat(model.pricing.completion)
				: model.pricing?.completion || 0;

		// OpenRouter pricing is already per token, so just multiply
		const promptCost = promptTokens * promptPrice;
		const completionCost = completionTokens * completionPrice;
		return promptCost + completionCost;
	}
}

let client: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
	if (!client) {
		client = new OpenRouterClient();
	}
	return client;
}

export { OpenRouterClient };
