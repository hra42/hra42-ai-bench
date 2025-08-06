export type BenchmarkType = 'text' | 'structured' | 'tool' | 'vision' | 'document';

export interface BenchmarkConfig {
  type: BenchmarkType;
  name: string;
  description?: string;
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  jsonSchema?: Record<string, any>;
  toolDefinitions?: any[];
  files?: File[];
}

export interface BenchmarkRun {
  id: string;
  name: string;
  description?: string;
  benchmarkType: BenchmarkType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalModels: number;
  completedModels: number;
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  totalCost: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface ModelResponse {
  id: string;
  runId: string;
  modelId: string;
  modelName?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'error';
  responseText?: string;
  errorMessage?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  cost?: number;
  latencyMs?: number;
  openRouterLatencyMs?: number;
  timeToFirstTokenMs?: number;
  tokensPerSecond?: number;
  startedAt?: Date;
  completedAt?: Date;
}