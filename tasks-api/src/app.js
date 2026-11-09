import express from "express";
import { ObjectId } from "mongodb";
import { validateTask } from "./validation.js";

/**
 * Convert a MongoDB document into the public JSON shape (`_id` -> `id`).
 * @param {import("mongodb").WithId<import("mongodb").Document>} doc
 */
function toJson({ _id, ...rest }) {
  return { id: _id.toString(), ...rest };
}

/**
 * Parse a route id, returning null when it is not a valid ObjectId.
 * @param {string} id
 */
function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

/**
 * Create the Express application. The database is injected so tests can use their own.
 * @param {import("mongodb").Db} db
 */
export function createApp(db) {
  const app = express();
  const tasks = db.collection("tasks");

  app.use(express.json());

  app.get("/health", async (_req, res) => {
    await db.command({ ping: 1 });
    res.json({ status: "ok", database: db.databaseName });
  });

  app.get("/tasks", async (_req, res) => {
    const docs = await tasks.find().sort({ createdAt: -1 }).toArray();
    res.json(docs.map(toJson));
  });

  app.get("/tasks/:id", async (req, res) => {
    const id = parseId(req.params.id);
    const doc = id && (await tasks.findOne({ _id: id }));
    if (!doc) return res.status(404).json({ error: "Task not found" });
    res.json(toJson(doc));
  });

  app.post("/tasks", async (req, res) => {
    const errors = validateTask(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const task = {
      title: req.body.title.trim(),
      done: req.body.done ?? false,
      createdAt: new Date(),
    };
    const { insertedId } = await tasks.insertOne(task);
    res.status(201).json(toJson({ _id: insertedId, ...task }));
  });

  app.patch("/tasks/:id", async (req, res) => {
    const errors = validateTask(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });

    const id = parseId(req.params.id);
    const update = {};
    if ("title" in req.body) update.title = req.body.title.trim();
    if ("done" in req.body) update.done = req.body.done;

    const doc =
      id &&
      (await tasks.findOneAndUpdate({ _id: id }, { $set: update }, { returnDocument: "after" }));
    if (!doc) return res.status(404).json({ error: "Task not found" });
    res.json(toJson(doc));
  });

  app.delete("/tasks/:id", async (req, res) => {
    const id = parseId(req.params.id);
    const result = id && (await tasks.deleteOne({ _id: id }));
    if (!result?.deletedCount) return res.status(404).json({ error: "Task not found" });
    res.status(204).end();
  });

  // Express 5 forwards rejected promises from async handlers to this middleware.
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ errors: ["body must be valid JSON"] });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
