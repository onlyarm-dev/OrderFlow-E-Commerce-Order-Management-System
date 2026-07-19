import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});
