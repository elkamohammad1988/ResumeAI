import express from "express";
import rateLimit from "express-rate-limit";
import {
  createCheckout,
  openPortal,
  getBillingMe,
} from "../controllers/billingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Anti-abuse: cap checkout attempts (Stripe charges per session creation).
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many checkout attempts. Try again in a minute." },
});

// Generic billing limiter for portal/me — protects Stripe rate quotas if a
// signed-in client misbehaves.
const billingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many billing requests. Try again in a minute." },
});

router.use(verifyToken);
router.use(billingLimiter);

router.post("/checkout", checkoutLimiter, createCheckout);
router.post("/portal", openPortal);
router.get("/me", getBillingMe);

export default router;
