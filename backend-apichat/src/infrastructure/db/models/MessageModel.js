import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    message: { type: String, required: true, minlength: 1, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
