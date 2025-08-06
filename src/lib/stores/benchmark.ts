import { writable } from 'svelte/store';
import type { BenchmarkConfig, BenchmarkRun, ModelResponse } from '$lib/types/benchmark';

export const benchmarkConfig = writable<BenchmarkConfig>({
  type: 'text',
  name: '',
  userPrompt: '',
  maxTokens: 1000,
  temperature: 0.7
});

export const currentRun = writable<BenchmarkRun | null>(null);
export const modelResponses = writable<ModelResponse[]>([]);
export const isRunning = writable(false);