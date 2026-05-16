import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import Group from "../models/Group";
import User from "../models/User";
import mongoose from "mongoose";

interface SocketWithUser extends Socket {
  userId?: string;
}

export const setupGroupSocket = (io: Server, socket: SocketWithUser) => {
  // Join a group room
  socket.on("join_group", async (data: { groupId: string; userId: string }) => {
    socket.join(`group_${data.groupId}`);
    // Also join a user-specific room for targeted notifications
    socket.join(`user_${data.userId}`);
    console.log(`🔌 Socket ${socket.id} joined group: ${data.groupId}`);
  });

  // Send message to a group
      socket.on(
        "send_group_message",
        async (data: {
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
    
            // Create message with chatId pointing to the group
            const message = await Message.create({
              chatId: new mongoose.Types.ObjectId(data.groupId),
              senderId: new mongoose.Types.ObjectId(data.senderId),
              text: data.text,
              attachments: data.attachments || [],
              replyTo: data.replyTo ? new mongoose.Types.ObjectId(data.replyTo) : undefined,
            });
    
            // Push message to group's messages array
            await Group.findByIdAndUpdate(data.groupId, {
              $push: { messages: message._id },
            });
    
            // Populate sender info and reply
            const populated = await message.populate([
              { path: "senderId", select: "username avatar" },
              {
                path: "replyTo",
                populate: { path: "senderId", select: "username" },
              },
            ]);
    
            // Broadcast to the group room
            io.to(`group_${data.groupId}`).emit("group_message_received", {
              _id: populated._id,
              chatId: populated.chatId,
              senderId: populated.senderId,
              text: populated.text,
              attachments: populated.attachments,
              replyTo: populated.replyTo,
              createdAt: populated.createdAt,
              groupId: data.groupId,
              senderUsername: (populated.senderId as any).username,
              senderAvatar: (populated.senderId as any).avatar,
              tempId: data.tempId,
            });
      } catch (error) {
        console.error("Error saving/sending group message via socket:", error);
      }
    }
  );

  // Group typing indicator
  socket.on(
    "group_typing",
    async (data: { groupId: string; userId: string; isTyping: boolean }) => {
      const user = await User.findById(data.userId).select("username");
      if (user) {
        socket.to(`group_${data.groupId}`).emit("group_user_typing", {
          groupId: data.groupId,
          userId: data.userId,
          username: user.username,
          isTyping: data.isTyping,
        });
      }
    }
  );

  // Leave group room
  socket.on("leave_group", (groupId: string) => {
    socket.leave(`group_${groupId}`);
    console.log(`🔌 Socket ${socket.id} left group: ${groupId}`);
  });
};
