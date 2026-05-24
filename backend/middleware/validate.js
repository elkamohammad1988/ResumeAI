/**
 * Tiny request-body validator. Two jobs:
 *
 * 1. NoSQL operator injection defense — coerces every declared field to a
 *    primitive. If a client posts `{ "email": { "$ne": null } }`, Mongoose
 *    would otherwise interpret that as a query operator. We reject anything
 *    that isn't a string.
 *
 * 2. Length / enum constraints — bound every text field so a single request
 *    can't bloat Mongo with megabytes of payload.
 *
 * Usage:
 *
 *   app.post(
 *     "/api/resume",
 *     validateBody({
 *       name: { type: "string", required: true, min: 1, max: 120, trim: true },
 *       email: { type: "string", max: 254, trim: true },
 *       language: { type: "string", enum: ["en", "fr", "ar"] },
 *     }),
 *     handler,
 *   );
 *
 * The validated values overwrite `req.body` so downstream code only sees
 * clean primitives.
 */

function asString(value) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") return null; // Reject objects/arrays/numbers.
  return value;
}

function asBool(value) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const out = {};

    for (const [field, rules] of Object.entries(schema)) {
      const raw = body[field];

      if (rules.type === "string") {
        const str = asString(raw);
        if (str === null) {
          return res
            .status(400)
            .json({ error: `Field "${field}" must be a string.` });
        }
        const trimmed = rules.trim ? str.trim() : str;
        if (rules.required && !trimmed) {
          return res
            .status(400)
            .json({ error: `Field "${field}" is required.` });
        }
        if (!trimmed && !rules.required) {
          out[field] = undefined;
          continue;
        }
        if (rules.min !== undefined && trimmed.length < rules.min) {
          return res
            .status(400)
            .json({
              error: `Field "${field}" must be at least ${rules.min} characters.`,
            });
        }
        if (rules.max !== undefined && trimmed.length > rules.max) {
          return res
            .status(400)
            .json({
              error: `Field "${field}" must be at most ${rules.max} characters.`,
            });
        }
        if (rules.enum && !rules.enum.includes(trimmed)) {
          return res
            .status(400)
            .json({ error: `Field "${field}" has an invalid value.` });
        }
        if (rules.pattern && !rules.pattern.test(trimmed)) {
          return res
            .status(400)
            .json({ error: `Field "${field}" has an invalid format.` });
        }
        if (rules.lowercase) {
          out[field] = trimmed.toLowerCase();
        } else {
          out[field] = trimmed;
        }
        continue;
      }

      if (rules.type === "boolean") {
        const b = asBool(raw);
        if (b === null && rules.required) {
          return res
            .status(400)
            .json({ error: `Field "${field}" must be a boolean.` });
        }
        out[field] = b;
        continue;
      }
    }

    req.body = out;
    next();
  };
}

// Common reusable validators.
export const emailRule = {
  type: "string",
  required: true,
  trim: true,
  lowercase: true,
  max: 254,
  // Pragmatic email regex — RFC-5322 is impractical; this matches what most
  // real-world inputs look like. Final validation happens at delivery.
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const passwordRule = {
  type: "string",
  required: true,
  min: 6,
  max: 128,
};

export const nameRule = {
  type: "string",
  required: true,
  trim: true,
  min: 1,
  max: 120,
};
