import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  togglePlan,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const authRoute = express.Router();

authRoute.post("/register", registerUser);
authRoute.post("/login", loginUser);
authRoute.get("/me", verifyToken, getMe);
authRoute.post("/change-password", verifyToken, changePassword);
authRoute.post("/toggle-plan", verifyToken, togglePlan);

export default authRoute;
