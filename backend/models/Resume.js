import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    email: String,
    phone: String,
    jobTitle: { type: String, required: true },
    jobDescription: String,
    language: {
      type: String,
      enum: ["en", "fr", "ar"],
      default: "en",
    },
    template: {
      type: String,
      enum: ["modern", "classic", "creative", "executive"],
      default: "modern",
    },
    skills: String,
    experience: String,
    education: String,
    photo: String, // base64 data URL — embedded in PDF templates
    resume: { type: String, required: true },
    coverLetter: String,
  },
  { timestamps: true },
);

export default mongoose.model("Resume", resumeSchema);
