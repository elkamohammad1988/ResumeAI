import express from "express";
import {
  generateResumeAndCoverLetter,
  duplicateResume,
  listMyResumes,
  getMyResume,
  deleteMyResume,
} from "../controllers/resumeController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

router.use(verifyToken);

// Validation mirrors the Next.js Zod schema in web/app/(app)/generator/actions.ts
// so direct API callers can't bypass length caps the UI enforces.
// `photo` is a base64 data URL — too large for the body validator's max-length
// rules, validated separately in the controller.
const generateSchema = {
  name: { type: "string", required: true, trim: true, min: 1, max: 120 },
  email: { type: "string", trim: true, max: 254 },
  phone: { type: "string", trim: true, max: 40 },
  jobTitle: { type: "string", required: true, trim: true, min: 1, max: 120 },
  jobDescription: { type: "string", trim: true, max: 8000 },
  skills: { type: "string", trim: true, max: 2000 },
  experience: { type: "string", trim: true, max: 8000 },
  education: { type: "string", trim: true, max: 2000 },
  language: { type: "string", enum: ["en", "fr", "ar"] },
  template: {
    type: "string",
    enum: ["executive", "modern", "classic", "creative"],
  },
};

router.post(
  "/",
  // Pass `photo` through untouched — the controller has length+format checks.
  (req, _res, next) => {
    req._photo = req.body?.photo;
    next();
  },
  validateBody(generateSchema),
  (req, _res, next) => {
    req.body.photo = req._photo;
    next();
  },
  generateResumeAndCoverLetter,
);

router.post("/:id/duplicate", duplicateResume);
router.get("/me", listMyResumes);
router.get("/:id", getMyResume);
router.delete("/:id", deleteMyResume);

export default router;
