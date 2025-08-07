import { initializeDatabase } from '$lib/server/db/init';

async function setupDatabase() {
	try {
		await initializeDatabase();
	} catch (error) {
		console.error('Failed to initialize database on startup:', error);
	}
}

setupDatabase();
