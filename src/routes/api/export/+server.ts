import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db/client';
import { exportToCSV, exportToJSON, type ExportFormat } from '$lib/utils/export';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { format, runId } = await request.json();

		if (!format || !['csv', 'json'].includes(format)) {
			throw error(400, 'Invalid export format');
		}

		if (!runId) {
			throw error(400, 'Run ID is required');
		}

		const db = await getDB();
		
		// Get the specific benchmark run with aggregated cost
		const runQuery = `
			SELECT 
				br.*,
				(SELECT COUNT(DISTINCT id) FROM model_responses WHERE run_id = br.id) as response_count,
				(SELECT COALESCE(SUM(cost), 0) FROM model_responses WHERE run_id = br.id) as actual_total_cost
			FROM benchmark_runs br
			WHERE br.id = ?
		`;

		const runs = await db.query(runQuery, [runId]);
		
		if (runs.length === 0) {
			throw error(404, 'Benchmark run not found');
		}

		const run = runs[0] as any;

		// Get responses for this run
		const responsesQuery = `
			SELECT 
				mr.*
			FROM model_responses mr
			WHERE mr.run_id = ?
			ORDER BY mr.created_at DESC
		`;
		
		const responses = await db.query(responsesQuery, [runId]);

		const exportData = {
			run: {
				id: run.id,
				name: run.name,
				description: run.description,
				benchmarkType: run.benchmark_type,
				status: run.status,
				totalModels: run.total_models,
				completedModels: run.completed_models,
				systemPrompt: run.system_prompt,
				userPrompt: run.user_prompt,
				maxTokens: run.max_tokens,
				temperature: run.temperature,
				totalCost: run.actual_total_cost || run.total_cost,
				startedAt: run.started_at ? new Date(run.started_at) : undefined,
				completedAt: run.completed_at ? new Date(run.completed_at) : undefined,
				createdAt: new Date(run.created_at)
			},
			responses: responses.map((response: any) => ({
				id: response.id,
				runId: response.run_id,
				modelId: response.model_id,
				status: response.status,
				responseText: response.response_text,
				responseJson: response.response_json,
				toolCalls: response.tool_calls,
				errorMessage: response.error_message,
				promptTokens: response.prompt_tokens,
				completionTokens: response.completion_tokens,
				totalTokens: response.total_tokens,
				cost: response.cost,
				latencyMs: response.latency_ms,
				openrouterLatencyMs: response.openrouter_latency_ms,
				generationTimeMs: response.generation_time_ms,
				tokensPerSecond: response.tokens_per_second,
				startedAt: response.started_at ? new Date(response.started_at) : undefined,
				completedAt: response.completed_at ? new Date(response.completed_at) : undefined,
				createdAt: new Date(response.created_at)
			})),
			metadata: {
				exportDate: new Date(),
				totalCost: run.actual_total_cost || run.total_cost || 0
			}
		};

		let content: string | Blob;
		let mimeType: string;
		
		switch (format as ExportFormat) {
			case 'csv':
				content = exportToCSV(exportData);
				mimeType = 'text/csv';
				break;
			case 'json':
				content = exportToJSON(exportData);
				mimeType = 'application/json';
				break;
			default:
				throw error(400, 'Unsupported export format');
		}

		return new Response(content, {
			headers: {
				'Content-Type': mimeType,
				'Content-Disposition': `attachment; filename="benchmark_${run.name || run.id}_export.${format}"`
			}
		});
	} catch (err) {
		console.error('Export error:', err);
		throw error(500, 'Failed to export data');
	}
};