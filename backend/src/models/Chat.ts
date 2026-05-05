import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  type: "direct" | "group";
  participants: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", chatSchema);
