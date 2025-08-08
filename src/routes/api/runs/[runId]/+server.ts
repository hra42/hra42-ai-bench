import type { RequestHandler } from './$types';
import { SimplifiedDBClient } from '$lib/server/db/client';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { runId } = params;

	try {
		const db = new SimplifiedDBClient();

		// Get run details
		const runs = await db.all(
			`
      SELECT * FROM benchmark_runs WHERE id = ?
    `,
			[runId]
		);

		const run = runs[0];

		if (!run) {
			return json({ error: 'Run not found' }, { status: 404 });
		}

		// Get all responses for this run
		const responses = await db.all(
			`
      SELECT 
        id,
        model_id,
        status,
        response_text,
        prompt_tokens,
        completion_tokens,
        total_tokens,
        cost,
        latency_ms,
        openrouter_latency_ms,
        generation_time_ms,
        moderation_latency_ms,
        time_to_first_token_ms,
        tokens_per_second,
        error_message
      FROM model_responses 
      WHERE run_id = ?
      ORDER BY started_at
    `,
			[runId]
		);

		return json({
			run,
			responses
		});
	} catch (error) {
		console.error('Error fetching run details:', error);
		return json({ error: 'Failed to fetch run details' }, { status: 500 });
	}
};
