export interface Model {
	id: string;
	name: string;
	description?: string;
	contextLength: number;
	pricing: {
		prompt: number;
		completion: number;
	};
	topProvider?: string | null;
	supportsTools?: boolean;
	supportsVision?: boolean;
	supportsJsonOutput?: boolean;
}

export interface ModelSelectionState {
	availableModels: Model[];
	selectedModels: string[];
	loading: boolean;
	error?: string;
}
