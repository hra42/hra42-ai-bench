import type { PageServerLoad } from './$types';
import { getDB } from '$lib/server/db/client';

export const load: PageServerLoad = async () => {
	try {
		const db = await getDB();

		// Get all benchmark runs with aggregated data
		const benchmarks = await db.query(`
			SELECT 
				br.id,
				br.name,
				br.benchmark_type as type,
				br.status,
				br.total_models,
				br.completed_models,
				br.created_at,
				br.completed_at,
				br.started_at,
				COALESCE(SUM(mr.cost), 0) as totalCost,
				COALESCE(AVG(mr.latency_ms), 0) as avgDuration,
				GROUP_CONCAT(DISTINCT m.name) as model_names
			FROM benchmark_runs br
			LEFT JOIN model_responses mr ON br.id = mr.run_id
			LEFT JOIN models m ON mr.model_id = m.id
			GROUP BY br.id
			ORDER BY br.created_at DESC
			LIMIT 100
		`);

		// Transform the data for the frontend
		const transformedBenchmarks = benchmarks.map((benchmark: any) => ({
			id: benchmark.id,
			name: benchmark.name,
			type: benchmark.type,
			models: benchmark.model_names ? benchmark.model_names.split(',') : [],
			status: benchmark.status,
			totalCost: Number(benchmark.totalCost) || 0,
			avgDuration: Number(benchmark.avgDuration) || 0,
			createdAt: new Date(benchmark.created_at),
			completedAt: benchmark.completed_at ? new Date(benchmark.completed_at) : null,
			startedAt: benchmark.started_at ? new Date(benchmark.started_at) : null,
			totalModels: benchmark.total_models,
			completedModels: benchmark.completed_models
		}));

		return {
			benchmarks: transformedBenchmarks
		};
	} catch (error) {
		console.error('Error loading benchmark history:', error);
		return {
			benchmarks: []
		};
	}
};
