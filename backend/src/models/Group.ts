import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  avatar?: string;
  admin: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      minlength: [1, "Minimum 1 character"],
      maxlength: [50, "Maximum 50 characters"],
    },
    description: {
      type: String,
      maxlength: [200, "Maximum 200 characters"],
      default: "",
    },
    avatar: {
      type: String,
      default: undefined,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

// Index for fast lookups of groups a user belongs to
groupSchema.index({ members: 1 });
groupSchema.index({ admin: 1 });

export default mongoose.model<IGroup>("Group", groupSchema);
