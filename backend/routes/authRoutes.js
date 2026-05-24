import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  togglePlan,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  validateBody,
  emailRule,
  passwordRule,
  nameRule,
} from "../middleware/validate.js";

const authRoute = express.Router();

authRoute.post(
  "/register",
  validateBody({
    name: nameRule,
    email: emailRule,
    password: passwordRule,
  }),
  registerUser,
);

authRoute.post(
  "/login",
  // Don't reuse `passwordRule` here — login passwords get bcrypt-compared
  // against a stored hash, so length rules are only for *new* passwords.
  // But we still must reject non-string values to block NoSQL injection.
  validateBody({
    email: emailRule,
    password: { type: "string", required: true, max: 1024 },
  }),
  loginUser,
);

authRoute.get("/me", verifyToken, getMe);

authRoute.post(
  "/change-password",
  verifyToken,
  validateBody({
    currentPassword: { type: "string", required: true, max: 1024 },
    newPassword: passwordRule,
  }),
  changePassword,
);

authRoute.post("/toggle-plan", verifyToken, togglePlan);

export default authRoute;
