import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoute from "./routes/authRoutes.js";
import resumeRoute from "./routes/resumeRoutes.js";

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

// Comma-separated whitelist for multi-environment deploys
const allowedOrigins = (process.env.CLIENT_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: false,
  }),
);
app.use(express.json({ limit: "1mb" }));

// Health check (Railway / Render polling)
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.get("/", (req, res) => {
  res.json({ message: "AI Resume Generator API", status: "ok" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use("/api/auth", authRoute);
app.use("/api/resume", resumeRoute);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
