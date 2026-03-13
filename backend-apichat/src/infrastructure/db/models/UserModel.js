import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    passwordHash: { type: String, required: true, select: false },
    refreshTokenHash: { type: String, default: null, select: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
