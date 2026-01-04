// apps/admin/src/lib/server/db/index.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = createClient({
  url: DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export * from './schema';
