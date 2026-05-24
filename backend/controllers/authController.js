import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  monthlyUsage,
  FREE_MONTHLY_LIMIT,
  isPaid,
  isSubscribed,
} from "../config/plans.js";

const JWT_EXPIRES_IN = "7d";

// Pre-computed bcrypt hash of an impossible password, used to make login
// constant-time regardless of whether the email exists. Prevents
// user-enumeration via response-time timing (OWASP A07).
const DUMMY_HASH =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8tF3rJ3z6oWxKqkY9CqM5kpqkVf5ze";

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  plan: user.plan,
  usageCount: monthlyUsage(user),
  usageLimit: isPaid(user) ? null : FREE_MONTHLY_LIMIT,
  // Billing state — null/undefined until first Checkout
  isSubscribed: isSubscribed(user),
  subscriptionStatus: user.subscriptionStatus || null,
  currentPeriodEnd: user.currentPeriodEnd || null,
  hasStripeCustomer: Boolean(user.stripeCustomerId),
});

export { publicUser };

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const token = signToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: publicUser(newUser),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    // Body has already been validated/coerced by validateBody middleware,
    // so `email` and `password` are guaranteed-trimmed lowercase strings.
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Always run bcrypt — against the real hash when the user exists,
    // against a dummy hash when not. Keeps timing uniform.
    const passwordToCompare = user?.password ?? DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, passwordToCompare);

    if (!user || !isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords are required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ error: "Current password is wrong" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};

/**
 * @deprecated Replaced by Stripe Checkout (see billingController).
 * Returns 410 Gone — clients should call POST /api/billing/checkout instead.
 * Kept as a route handler purely to give a helpful error rather than 404.
 */
export const togglePlan = async (_req, res) => {
  res.status(410).json({
    error:
      "This endpoint has been removed. Upgrade is now handled via Stripe Checkout at POST /api/billing/checkout.",
    code: "endpoint_removed",
  });
};
