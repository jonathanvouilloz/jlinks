import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

// Get database path from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || './data/noko.db';

// Extract file path from URL (remove 'file:' prefix if present)
const dbPath = DATABASE_URL.replace(/^file:/, '');

// Create database connection
const sqlite = new Database(dbPath, { create: true });

// Enable WAL mode for better concurrent access
sqlite.exec('PRAGMA journal_mode = WAL;');

// Create Drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export schema for use in other files
export * from './schema';
