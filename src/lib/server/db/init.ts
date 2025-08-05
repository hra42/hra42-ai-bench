import { getDB } from './client';
import { createSchema } from './schema';

export async function initializeDatabase(): Promise<void> {
  const db = getDB();
  
  try {
    console.log('Initializing database schema...');
    await db.exec(createSchema);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function checkDatabaseConnection(): Promise<boolean> {
  const db = getDB();
  
  try {
    const result = await db.query<{ test: number }>('SELECT 1 as test');
    return result.length > 0 && result[0].test === 1;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}