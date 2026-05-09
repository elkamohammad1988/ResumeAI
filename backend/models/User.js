import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    usageCount: { type: Number, default: 0 },
    usageResetAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
