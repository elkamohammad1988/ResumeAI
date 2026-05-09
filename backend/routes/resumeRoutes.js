import express from "express";
import {
  generateResumeAndCoverLetter,
  duplicateResume,
  listMyResumes,
  getMyResume,
  deleteMyResume,
} from "../controllers/resumeController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", generateResumeAndCoverLetter);
router.post("/:id/duplicate", duplicateResume);
router.get("/me", listMyResumes);
router.get("/:id", getMyResume);
router.delete("/:id", deleteMyResume);

export default router;
