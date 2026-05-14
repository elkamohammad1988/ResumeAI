import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import authRoute from "./routes/authRoutes.js";
import resumeRoute from "./routes/resumeRoutes.js";
import billingRoute from "./routes/billingRoutes.js";
import { handleWebhook } from "./controllers/billingController.js";

const requiredEnv = ["MONGODB_URI", "JWT_SECRET", "GEMINI_API_KEY"];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    `Missing required env vars: ${missing.join(", ")}. See backend/.env.example`,
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Behind a proxy (Railway/Render/Vercel/etc.) — trust X-Forwarded-* for
// correct client IP in rate-limit / req.protocol.
app.set("trust proxy", 1);

// ─── Security headers ────────────────────────────────────────────────
// helmet defaults are sensible; disable CSP to avoid breaking the API JSON
// responses (CSP is a frontend concern — Vercel handles it for /client).
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// ─── CORS (multi-origin via comma-separated env) ─────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin (no Origin header) and CLI tools
      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: false,
  }),
);

// ─── Stripe webhook — RAW BODY before express.json() ─────────────────
// Stripe signs the raw bytes; any JSON re-serialisation breaks verification.
app.post(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

// ─── JSON parser for the rest of the API ─────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ─── Health checks (Railway/Render polling) ──────────────────────────
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/", (_req, res) =>
  res.json({ message: "AI Resume Generator API", status: "ok" }),
);

// ─── Per-route rate limiting ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 attempts/min/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts. Try again in a minute." },
});

const resumeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12, // 12 generations/min/IP — well above any human pace
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again in a minute." },
});

// ─── DB connect ──────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// ─── Routes ──────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoute);
app.use("/api/resume", resumeLimiter, resumeRoute);
app.use("/api/billing", billingRoute); // checkout has its own tighter limiter

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error fallback
app.use((err, _req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS origins: ${allowedOrigins.join(", ")}`);
  if (process.env.STRIPE_SECRET_KEY) {
    console.log("Stripe: enabled");
  } else {
    console.log("Stripe: disabled (set STRIPE_SECRET_KEY to enable)");
  }
});
