import mongoose, { Schema, Document } from "mongoose";

export interface ISupergroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  avatar?: string;
  admin: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const supergroupSchema = new Schema<ISupergroup>(
  {
    name: {
      type: String,
      required: [true, "Supergroup name is required"],
      trim: true,
      minlength: [1, "Minimum 1 character"],
      maxlength: [60, "Maximum 60 characters"],
    },
    description: {
      type: String,
      maxlength: [300, "Maximum 300 characters"],
      default: "",
    },
    avatar: {
      type: String,
      default: "",
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
  },
  { timestamps: true }
);

export default mongoose.model<ISupergroup>("Supergroup", supergroupSchema);
