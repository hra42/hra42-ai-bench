import { DuckDBInstance, DuckDBConnection } from '@duckdb/node-api';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

class DuckDBClient {
	private instance: DuckDBInstance | null = null;
	private connection: DuckDBConnection | null = null;
	private dbPath: string;

	constructor(dbPath: string = env.DATABASE_PATH || 'data/hra42.duckdb') {
		this.dbPath = dbPath;
	}

	private async ensureDirectoryExists(): Promise<void> {
		const dir = dirname(this.dbPath);
		if (dir && dir !== '.') {
			try {
				await mkdir(dir, { recursive: true });
			} catch (error) {
				console.error('Failed to create database directory:', error);
			}
		}
	}

	async connect(): Promise<DuckDBConnection> {
		if (!this.connection) {
			await this.ensureDirectoryExists();
			this.instance = await DuckDBInstance.create(this.dbPath);
			this.connection = await DuckDBConnection.create(this.instance);
		}
		return this.connection;
	}

	async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
		const conn = await this.connect();

		if (params && params.length > 0) {
			const statement = await conn.prepare(sql);
			// Bind parameters one by one with proper indexing
			for (let i = 0; i < params.length; i++) {
				let value = params[i];
				// Handle undefined values as null
				if (value === undefined) {
					value = null;
				}
				// Convert booleans to integers for DuckDB
				if (typeof value === 'boolean') {
					value = value ? 1 : 0;
				}
				// DuckDB uses 1-based indexing for parameters
				statement.bindValue(i + 1, value as any);
			}
			const result = await statement.run();
			// Get rows as objects instead of arrays
			const columns = result.columnNames();
			const rawRows = await result.getRows();
			const data = rawRows.map((row) => {
				const obj: Record<string, unknown> = {};
				columns.forEach((col, idx) => {
					obj[col] = row[idx];
				});
				return obj;
			}) as T[];
			statement.destroySync();
			return data;
		} else {
			const result = await conn.run(sql);
			// Get rows as objects instead of arrays
			const columns = result.columnNames();
			const rawRows = await result.getRows();
			const data = rawRows.map((row) => {
				const obj: Record<string, unknown> = {};
				columns.forEach((col, idx) => {
					obj[col] = row[idx];
				});
				return obj;
			}) as T[];
			return data;
		}
	}

	async exec(sql: string): Promise<void> {
		const conn = await this.connect();
		await conn.run(sql);
	}

	async close(): Promise<void> {
		if (this.connection) {
			this.connection.closeSync();
			this.connection = null;
		}
		if (this.instance) {
			this.instance.closeSync();
			this.instance = null;
		}
	}
}

let dbClient: DuckDBClient | null = null;

export function getDB(): DuckDBClient {
	if (!dbClient) {
		dbClient = new DuckDBClient();
	}
	return dbClient;
}

export function getDuckDBClient(): DuckDBClient {
	return getDB();
}

export async function closeDB(): Promise<void> {
	if (dbClient) {
		await dbClient.close();
		dbClient = null;
	}
}

// Helper methods for simplified database operations
export class SimplifiedDBClient {
	private client: DuckDBClient;

	constructor() {
		this.client = getDB();
	}

	// Helper to convert BigInt values to numbers for JSON serialization
	private serializeBigInt(obj: unknown): unknown {
		return JSON.parse(
			JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? Number(value) : value))
		);
	}

	async all(sql: string, params?: unknown[]): Promise<unknown[]> {
		const results = await this.client.query(sql, params);
		return results.map((r) => this.serializeBigInt(r));
	}

	async run(sql: string, params?: unknown[]): Promise<void> {
		if (params) {
			await this.client.query(sql, params);
		} else {
			await this.client.exec(sql);
		}
	}

	async prepare(sql: string): Promise<{
		run: (params: unknown[]) => Promise<void>;
		finalize: () => Promise<void>;
	}> {
		return {
			run: async (params: unknown[]) => {
				await this.client.query(sql, params);
			},
			finalize: async () => {
				// No-op for compatibility
			}
		};
	}
}

if (dev) {
	process.on('SIGTERM', closeDB);
	process.on('SIGINT', closeDB);
}
