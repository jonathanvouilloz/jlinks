import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Turso database configuration
const DATABASE_URL = process.env.DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create libSQL client for Turso
const client = createClient({
  url: DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from './schema';
