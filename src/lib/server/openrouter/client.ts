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
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hra42-bench.ai',
        'X-Title': 'HRA42 AI Benchmark',
        ...options?.headers,
      },
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
      body: JSON.stringify(request),
    });
  }

  async chatStream(request: OpenRouterChatRequest): Promise<ReadableStream> {
    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hra42-bench.ai',
        'X-Title': 'HRA42 AI Benchmark',
      },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response.body!;
  }

  async getModelDetails(modelId: string): Promise<OpenRouterModel> {
    const models = await this.getModels();
    const model = models.find(m => m.id === modelId);
    
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    return model;
  }

  calculateCost(model: OpenRouterModel, promptTokens: number, completionTokens: number): number {
    const promptCost = (promptTokens / 1_000_000) * (model.pricing?.prompt || 0);
    const completionCost = (completionTokens / 1_000_000) * (model.pricing?.completion || 0);
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