import { config } from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

config({ path: [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../.env')] });

const env_schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
});

export const env = env_schema.parse(process.env);
