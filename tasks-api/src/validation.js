/**
 * Validate the payload of a task. Returns a list of error messages (empty when valid).
 * @param {unknown} body
 * @param {{ partial?: boolean }} options partial=true for updates (no required fields)
 * @returns {string[]}
 */
export function validateTask(body, { partial = false } = {}) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return ["body must be a JSON object"];
  }

  if (partial && !("title" in body) && !("done" in body)) {
    return ["at least one of title or done must be provided"];
  }

  const errors = [];

  if (!partial || "title" in body) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      errors.push("title is required and must be a non-empty string");
    } else if (body.title.length > 100) {
      errors.push("title must be at most 100 characters");
    }
  }

  if ("done" in body && typeof body.done !== "boolean") {
    errors.push("done must be a boolean");
  }

  return errors;
}
