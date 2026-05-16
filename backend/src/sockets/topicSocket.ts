import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import Topic from "../models/Topic";
import User from "../models/User";
import mongoose from "mongoose";

interface SocketWithUser extends Socket {
  userId?: string;
}

export const setupTopicSocket = (io: Server, socket: SocketWithUser) => {
  // Join a topic room
  socket.on("join_topic", (data: { topicId: string; groupId: string }) => {
    socket.join(`topic_${data.topicId}`);
    console.log(`🔌 Socket ${socket.id} joined topic: ${data.topicId}`);
  });

  // Send message to a topic
  socket.on(
    "send_topic_message",
    async (data: {
      topicId: string;
      groupId: string;
      senderId: string;
      text: string;
      attachments?: any[];
      replyTo?: string;
      tempId?: string;
    }) => {
      try {
        if (!data.text.trim() && (!data.attachments || data.attachments.length === 0)) {
          return;
        }

        const message = await Message.create({
          chatId: new mongoose.Types.ObjectId(data.groupId),
          topicId: new mongoose.Types.ObjectId(data.topicId),
          senderId: new mongoose.Types.ObjectId(data.senderId),
          text: data.text,
          attachments: data.attachments || [],
          replyTo: data.replyTo ? new mongoose.Types.ObjectId(data.replyTo) : undefined,
        });

        // Push message to topic's messages array
        await Topic.findByIdAndUpdate(data.topicId, {
          $push: { messages: message._id },
        });

        const populated = await message.populate([
          { path: "senderId", select: "username avatar" },
          {
            path: "replyTo",
            populate: { path: "senderId", select: "username" },
          },
        ]);

        // Broadcast to the topic room
        io.to(`topic_${data.topicId}`).emit("topic_message_received", {
          _id: populated._id,
          chatId: populated.chatId,
          topicId: data.topicId,
          groupId: data.groupId,
          senderId: populated.senderId,
          text: populated.text,
          attachments: populated.attachments,
          replyTo: populated.replyTo,
          createdAt: populated.createdAt,
          senderUsername: (populated.senderId as any).username,
          senderAvatar: (populated.senderId as any).avatar,
          tempId: data.tempId,
        });

        // Also notify the supergroup room for sidebar last-message updates
        io.to(`supergroup_${data.groupId}`).emit("group_message_received", {
          _id: populated._id,
          chatId: populated.chatId,
          topicId: data.topicId,
          groupId: data.groupId,
          senderId: populated.senderId,
          text: populated.text,
          createdAt: populated.createdAt,
          senderUsername: (populated.senderId as any).username,
          tempId: data.tempId,
        });
      } catch (error) {
        console.error("Error saving/sending topic message via socket:", error);
      }
    }
  );

  // Topic typing indicator
  socket.on(
    "topic_typing",
    async (data: { topicId: string; userId: string; isTyping: boolean }) => {
      const user = await User.findById(data.userId).select("username");
      if (user) {
        socket.to(`topic_${data.topicId}`).emit("topic_user_typing", {
          topicId: data.topicId,
          userId: data.userId,
          username: user.username,
          isTyping: data.isTyping,
        });
      }
    }
  );

  // Leave topic room
  socket.on("leave_topic", (topicId: string) => {
    socket.leave(`topic_${topicId}`);
  });
};
