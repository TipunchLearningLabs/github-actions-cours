import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { connectDb } from "./db.js";

const config = loadConfig();
const { client, db } = await connectDb(config.mongoUri, config.dbName);
const app = createApp(db);

const server = app.listen(config.port, () => {
  console.log(`tasks-api listening on http://localhost:${config.port} (db: ${config.dbName})`);
});

/**
 * Close the HTTP server and the MongoDB connection, then exit.
 */
function shutdown() {
  server.close(async () => {
    await client.close();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
