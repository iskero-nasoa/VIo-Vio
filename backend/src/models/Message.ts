import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  attachments?: Array<{
    type: "image" | "video";
    url: string;
    filename: string;
    size: number;
  }>;
  replyTo?: mongoose.Types.ObjectId;
  status: "sent" | "delivered" | "read";
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, trim: true, default: "" },
    attachments: [
      {
        type: { type: String, enum: ["image", "video"] },
        url: { type: String },
        filename: { type: String },
        size: { type: Number },
      },
    ],
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", messageSchema);
