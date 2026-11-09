import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config.js";

describe("loadConfig", () => {
  it("throws when MONGODB_URI is missing", () => {
    expect(() => loadConfig({})).toThrow("MONGODB_URI");
  });

  it("applies defaults for PORT and MONGODB_DB_NAME", () => {
    expect(loadConfig({ MONGODB_URI: "mongodb://localhost:27017" })).toEqual({
      port: 3000,
      mongoUri: "mongodb://localhost:27017",
      dbName: "tasks",
    });
  });

  it("reads every value from the environment", () => {
    const config = loadConfig({
      PORT: "4000",
      MONGODB_URI: "mongodb://db:27017",
      MONGODB_DB_NAME: "tasks_ci",
    });
    expect(config).toEqual({ port: 4000, mongoUri: "mongodb://db:27017", dbName: "tasks_ci" });
  });
});
