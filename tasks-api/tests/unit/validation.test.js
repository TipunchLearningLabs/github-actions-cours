import { describe, expect, it } from "vitest";
import { validateTask } from "../../src/validation.js";

describe("validateTask", () => {
  it("accepts a valid task", () => {
    expect(validateTask({ title: "Learn GitHub Actions" })).toEqual([]);
  });

  it("rejects a missing title", () => {
    expect(validateTask({})).toContain("title is required and must be a non-empty string");
  });

  it("rejects a blank title", () => {
    expect(validateTask({ title: "   " })).toHaveLength(1);
  });

  it("rejects a title longer than 100 characters", () => {
    expect(validateTask({ title: "a".repeat(101) })).toContain(
      "title must be at most 100 characters",
    );
  });

  it("rejects a non-boolean done", () => {
    expect(validateTask({ title: "ok", done: "yes" })).toContain("done must be a boolean");
  });

  it("rejects a non-object body", () => {
    expect(validateTask(null)).toEqual(["body must be a JSON object"]);
    expect(validateTask([])).toEqual(["body must be a JSON object"]);
  });

  it("allows partial updates without title", () => {
    expect(validateTask({ done: true }, { partial: true })).toEqual([]);
  });

  it("rejects an empty partial update", () => {
    expect(validateTask({}, { partial: true })).toHaveLength(1);
  });
});
