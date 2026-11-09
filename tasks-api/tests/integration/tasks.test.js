import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { connectDb } from "../../src/db.js";

// Requires a running MongoDB reachable through MONGODB_URI.
// A dedicated "<db>_test" database is used so local data is never wiped.
const config = loadConfig();
let client;
let db;
let app;

beforeAll(async () => {
  ({ client, db } = await connectDb(config.mongoUri, `${config.dbName}_test`));
  app = createApp(db);
});

beforeEach(async () => {
  await db.collection("tasks").deleteMany({});
});

afterAll(async () => {
  await db.dropDatabase();
  await client.close();
});

describe("tasks API", () => {
  it("GET /health pings the database", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", database: `${config.dbName}_test` });
  });

  it("POST /tasks creates a task", async () => {
    const res = await request(app).post("/tasks").send({ title: "  Write a workflow  " });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Write a workflow", done: false });
    expect(res.body.id).toBeTypeOf("string");
  });

  it("POST /tasks rejects an invalid payload", async () => {
    const res = await request(app).post("/tasks").send({ title: "" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(1);
  });

  it("POST /tasks rejects malformed JSON", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
  });

  it("GET /tasks lists tasks", async () => {
    await request(app).post("/tasks").send({ title: "one" });
    await request(app).post("/tasks").send({ title: "two" });
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("GET /tasks/:id returns a task or 404", async () => {
    const created = await request(app).post("/tasks").send({ title: "find me" });
    const found = await request(app).get(`/tasks/${created.body.id}`);
    expect(found.body.title).toBe("find me");

    expect((await request(app).get("/tasks/not-an-id")).status).toBe(404);
    expect((await request(app).get("/tasks/507f1f77bcf86cd799439011")).status).toBe(404);
  });

  it("PATCH /tasks/:id updates a task", async () => {
    const created = await request(app).post("/tasks").send({ title: "todo" });
    const res = await request(app).patch(`/tasks/${created.body.id}`).send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: "todo", done: true });
  });

  it("DELETE /tasks/:id removes a task", async () => {
    const created = await request(app).post("/tasks").send({ title: "bye" });
    expect((await request(app).delete(`/tasks/${created.body.id}`)).status).toBe(204);
    expect((await request(app).delete(`/tasks/${created.body.id}`)).status).toBe(404);
  });
});
