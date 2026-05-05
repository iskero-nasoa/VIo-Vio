import mongoose, { Schema, Document } from "mongoose";

export interface IDeletedMessage extends Document {
  userId: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId;
  deletedAt: Date;
}

const deletedMessageSchema = new Schema<IDeletedMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messageId: {
    type: Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  }
});

// Индекс для быстрого поиска удаленных сообщений конкретного пользователя
deletedMessageSchema.index({ userId: 1, messageId: 1 }, { unique: true });

const DeletedMessage = mongoose.model<IDeletedMessage>("DeletedMessage", deletedMessageSchema);
export default DeletedMessage;
