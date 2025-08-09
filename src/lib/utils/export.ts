import type { BenchmarkRun, ModelResponse } from '$lib/types/benchmark';

export type ExportFormat = 'csv' | 'json';

interface ExportData {
	run?: BenchmarkRun;
	responses?: ModelResponse[];
	metadata?: {
		exportDate: Date;
		totalCost?: number;
	};
}

function escapeCSV(value: any): string {
	if (value === null || value === undefined) return '';
	const str = String(value);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export function exportToCSV(data: ExportData): string {
	const { run, responses } = data;
	const rows: string[] = [];

	// Add benchmark run info
	if (run) {
		rows.push(`Benchmark: ${escapeCSV(run.name)}`);
		rows.push(`Type: ${escapeCSV(run.benchmarkType)}`);
		rows.push(`Status: ${escapeCSV(run.status)}`);
		rows.push(`Total Cost: $${run.totalCost?.toFixed(4) || '0'}`);
		rows.push(`Date: ${run.createdAt?.toISOString() || new Date().toISOString()}`);
		rows.push(''); // Empty line
	}

	// Add response data
	if (responses && responses.length > 0) {
		const headers = [
			'Model',
			'Status',
			'Response',
			'Cost',
			'Prompt Tokens',
			'Completion Tokens',
			'Total Tokens',
			'Latency (ms)',
			'Tokens/Second'
		];
		rows.push(headers.map(escapeCSV).join(','));

		responses.forEach((response) => {
			const row = [
				response.modelId,
				response.status,
				response.responseText?.substring(0, 500) || '',
				response.cost?.toFixed(6) || '0',
				response.promptTokens || 0,
				response.completionTokens || 0,
				response.totalTokens || 0,
				response.latencyMs || 0,
				response.tokensPerSecond?.toFixed(2) || '0'
			];
			rows.push(row.map(escapeCSV).join(','));
		});
	}

	return rows.join('\n');
}

export function exportToJSON(data: ExportData): string {
	// Custom replacer to handle BigInt values
	const replacer = (key: string, value: any) => {
		if (typeof value === 'bigint') {
			return value.toString();
		}
		return value;
	};
	
	return JSON.stringify(data, replacer, 2);
}


export async function downloadFile(
	content: string | Blob,
	filename: string,
	mimeType?: string
): Promise<void> {
	const blob = content instanceof Blob 
		? content 
		: new Blob([content], { type: mimeType || 'text/plain' });
	
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function generateExportFilename(
	format: ExportFormat,
	prefix: string = 'benchmark'
): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
	const extensions: Record<ExportFormat, string> = {
		csv: 'csv',
		json: 'json'
	};
	return `${prefix}_export_${timestamp}.${extensions[format]}`;
}