import mongoose, { Schema, Document } from "mongoose";

export interface ITopic extends Document {
  _id: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema<ITopic>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Topic name is required"],
      trim: true,
      minlength: [1, "Minimum 1 character"],
      maxlength: [50, "Maximum 50 characters"],
    },
    description: {
      type: String,
      maxlength: [200, "Maximum 200 characters"],
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

topicSchema.index({ groupId: 1 });

export default mongoose.model<ITopic>("Topic", topicSchema);
