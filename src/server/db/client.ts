import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "./schema";

export type Database = MySql2Database<typeof schema>;

const globalForDb = globalThis as unknown as { hookedPool?: mysql.Pool; hookedDb?: Database };

function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and start MySQL: docker compose up -d");
  }
  return mysql.createPool({
    uri: url,
    connectionLimit: 10,
    // Store and read DATETIME as UTC.
    timezone: "Z",
    dateStrings: false,
    supportBigNumbers: true,
  });
}

/** Shared connection pool (reused across hot reloads in development). */
export function getDb(): Database {
  if (!globalForDb.hookedDb) {
    globalForDb.hookedPool ??= createPool();
    globalForDb.hookedDb = drizzle(globalForDb.hookedPool, { schema, mode: "default" });
  }
  return globalForDb.hookedDb;
}

export { schema };
