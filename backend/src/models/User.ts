import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  description?: string;
  status: "online" | "offline" | "away";
  statusText?: string;
  phone?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): Record<string, unknown>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Имя пользователя обязательно"],
      unique: true,
      trim: true,
      minlength: [3, "Минимум 3 символа"],
      maxlength: [30, "Максимум 30 символов"],
      match: [/^[a-zA-Z0-9_]+$/, "Только буквы, цифры и _"],
    },
    email: {
      type: String,
      required: [true, "Email обязателен"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Некорректный email"],
    },
    password: {
      type: String,
      required: [true, "Пароль обязателен"],
      minlength: [6, "Минимум 6 символов"],
      select: false, // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: undefined,
    },
    description: {
      type: String,
      maxlength: [200, "Максимум 200 символов"],
      default: "",
    },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    statusText: {
      type: String,
      maxlength: [50, "Максимум 50 символов"],
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return user data without sensitive fields
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    description: this.description,
    status: this.status,
    statusText: this.statusText,
    phone: this.phone,
    role: this.role,
    createdAt: this.createdAt.toISOString(),
  };
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
