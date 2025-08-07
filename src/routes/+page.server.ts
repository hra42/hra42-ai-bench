import type { PageServerLoad } from './$types';
import { SimplifiedDBClient } from '$lib/server/db/client';

export const load: PageServerLoad = async () => {
	const db = new SimplifiedDBClient();

	try {
		// Get overall statistics
		const statsQuery = `
			SELECT 
				COUNT(DISTINCT br.id) as total_benchmarks,
				COALESCE(SUM(br.total_cost), 0) as total_cost,
				COALESCE(AVG(mr.latency_ms), 0) as avg_response_time
			FROM benchmark_runs br
			LEFT JOIN model_responses mr ON br.id = mr.run_id
			WHERE br.status = 'completed'
		`;
		const stats = await db.all(statsQuery);

		// Get recent benchmarks
		const recentQuery = `
			SELECT 
				br.id,
				br.name,
				br.benchmark_type as type,
				COUNT(DISTINCT mr.model_id) as model_count,
				COALESCE(br.total_cost, 0) as cost,
				br.created_at
			FROM benchmark_runs br
			LEFT JOIN model_responses mr ON br.id = mr.run_id
			GROUP BY br.id, br.name, br.benchmark_type, br.total_cost, br.created_at
			ORDER BY br.created_at DESC
			LIMIT 5
		`;
		const recentBenchmarks = await db.all(recentQuery);

		// Get top performing models
		const topModelsQuery = `
			SELECT 
				m.name,
				COUNT(DISTINCT mr.run_id) as usage_count,
				COALESCE(AVG(mr.cost), 0) as avg_cost,
				COALESCE(AVG(mr.latency_ms), 0) as avg_time
			FROM models m
			JOIN model_responses mr ON m.id = mr.model_id
			WHERE mr.status = 'completed'
			GROUP BY m.id, m.name
			HAVING COUNT(DISTINCT mr.run_id) > 0
			ORDER BY usage_count DESC, avg_cost ASC
			LIMIT 10
		`;
		const topModels = await db.all(topModelsQuery);

		// Get unique models count
		const modelsCountQuery = `
			SELECT COUNT(DISTINCT model_id) as models_tested
			FROM model_responses
			WHERE status = 'completed'
		`;
		const modelsCount = await db.all(modelsCountQuery);

		return {
			totalBenchmarks: stats[0]?.total_benchmarks || 0,
			totalCost: parseFloat(stats[0]?.total_cost || '0'),
			avgResponseTime: parseFloat(stats[0]?.avg_response_time || '0'),
			modelsTested: modelsCount[0]?.models_tested || 0,
			recentBenchmarks: recentBenchmarks.map(b => ({
				id: b.id,
				name: b.name || 'Unnamed Benchmark',
				type: b.type,
				modelCount: parseInt(b.model_count || '0'),
				cost: parseFloat(b.cost || '0'),
				createdAt: new Date(b.created_at)
			})),
			topModels: topModels.map(m => ({
				name: m.name,
				usageCount: parseInt(m.usage_count || '0'),
				avgCost: parseFloat(m.avg_cost || '0'),
				avgTime: parseFloat(m.avg_time || '0')
			}))
		};
	} catch (error) {
		console.error('Error loading dashboard data:', error);
		// Return empty data on error
		return {
			totalBenchmarks: 0,
			totalCost: 0,
			avgResponseTime: 0,
			modelsTested: 0,
			recentBenchmarks: [],
			topModels: []
		};
	}
};