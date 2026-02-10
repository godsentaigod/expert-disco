/**
 * Database Connection Helper for Agent Operations
 * Provides lazy-loaded database connection for agent modules
 */

import { drizzle } from "drizzle-orm/mysql2";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Agent DB] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
