import { writable } from 'svelte/store';
import type { Model } from '$lib/types/model';

export const availableModels = writable<Model[]>([]);
export const selectedModels = writable<string[]>([]);
export const modelsLoading = writable(false);
export const modelsError = writable<string | null>(null);

export async function loadModels() {
	modelsLoading.set(true);
	modelsError.set(null);

	try {
		const response = await fetch('/api/models');
		if (!response.ok) {
			throw new Error(`Failed to load models: ${response.statusText}`);
		}

		const models = await response.json();
		availableModels.set(models);
	} catch (error) {
		modelsError.set(error instanceof Error ? error.message : 'Failed to load models');
	} finally {
		modelsLoading.set(false);
	}
}
