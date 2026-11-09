import { expect, test } from "@playwright/test";

// API-only end-to-end tests: Playwright's `request` fixture sends real HTTP
// requests to the running server, no browser is needed.

test("health endpoint reports the configured database", async ({ request }) => {
  const res = await request.get("/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(body.database).toBe(process.env.MONGODB_DB_NAME ?? "tasks");
});

test("full task lifecycle: create, read, update, delete", async ({ request }) => {
  const created = await request.post("/tasks", { data: { title: "E2E task" } });
  expect(created.status()).toBe(201);
  const { id } = await created.json();

  const list = await request.get("/tasks");
  expect((await list.json()).map((t) => t.id)).toContain(id);

  const updated = await request.patch(`/tasks/${id}`, { data: { done: true } });
  expect(await updated.json()).toMatchObject({ id, title: "E2E task", done: true });

  expect((await request.delete(`/tasks/${id}`)).status()).toBe(204);
  expect((await request.get(`/tasks/${id}`)).status()).toBe(404);
});

test("invalid payload is rejected with 400", async ({ request }) => {
  const res = await request.post("/tasks", { data: { done: "nope" } });
  expect(res.status()).toBe(400);
  expect((await res.json()).errors.length).toBeGreaterThan(0);
});
