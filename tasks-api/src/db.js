import { MongoClient } from "mongodb";

/**
 * Connect to MongoDB and return the client and the selected database.
 * @param {string} uri
 * @param {string} dbName
 */
export async function connectDb(uri, dbName) {
  const client = new MongoClient(uri);
  await client.connect();
  return { client, db: client.db(dbName) };
}
