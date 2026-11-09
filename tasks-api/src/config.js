import { existsSync } from "node:fs";

/**
 * Load a local .env file if present. Variables already set in the
 * environment (e.g. by GitHub Actions) are never overwritten.
 */
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

/**
 * Build the application configuration from environment variables.
 * @param {NodeJS.ProcessEnv} env
 * @returns {{ port: number, mongoUri: string, dbName: string }}
 */
export function loadConfig(env = process.env) {
  if (!env.MONGODB_URI) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }

  return {
    port: Number(env.PORT ?? 3000),
    mongoUri: env.MONGODB_URI,
    dbName: env.MONGODB_DB_NAME ?? "tasks",
  };
}
