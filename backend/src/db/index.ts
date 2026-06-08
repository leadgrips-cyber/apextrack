import { Pool, type QueryResultRow } from 'pg';
import databaseConfig from "../config/database.js";

export const pool = new Pool(databaseConfig);

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const client = await pool.connect();
  try {
    const result = await client.query<T>(text, params);
    return result;
  } finally {
    client.release();
  }
}
