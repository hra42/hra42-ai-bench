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

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const conn = await this.connect();
    
    if (params && params.length > 0) {
      const statement = await conn.prepare(sql);
      statement.bind(params);
      const result = await statement.run();
      const data = await result.getRows() as T[];
      statement.destroySync();
      return data;
    } else {
      const result = await conn.run(sql);
      return await result.getRows() as T[];
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

export async function closeDB(): Promise<void> {
  if (dbClient) {
    await dbClient.close();
    dbClient = null;
  }
}

if (dev) {
  process.on('SIGTERM', closeDB);
  process.on('SIGINT', closeDB);
}