import { Server, Socket } from "socket.io";
import { sendMessage } from "../controllers/messageController";
import User from "../models/User";

interface SocketWithUser extends Socket {
  userId?: string;
}

export const setupMessageSocket = (io: Server, socket: SocketWithUser) => {
  socket.on("join_chat", async (data: { chatId: string; userId: string }) => {
    socket.join(data.chatId);
    console.log(`🔌 Socket ${socket.id} joined chat: ${data.chatId}`);
    
    // Fetch user info
    const user = await User.findById(data.userId).select("username");
    if (user) {
      socket.to(data.chatId).emit("user_joined", { userId: data.userId, username: user.username });
    }
  });

  socket.on(
    "send_message",
    async (data: { chatId: string; senderId: string; text: string; attachments?: any[]; replyTo?: string }) => {
      try {
        // Save message using controller
        const message = await sendMessage(data.chatId, data.text, data.senderId, data.attachments, data.replyTo);

        // Broadcast to room
        io.to(data.chatId).emit("message_received", {
          _id: message._id,
          chatId: message.chatId,
          senderId: message.senderId,
          text: message.text,
          attachments: message.attachments,
          replyTo: message.replyTo, // Include the populated replyTo data
          createdAt: message.createdAt,
          // Populated data
          senderUsername: (message.senderId as any).username,
          senderAvatar: (message.senderId as any).avatar
        });
      } catch (error) {
        console.error("Error saving/sending message via socket:", error);
      }
    }
  );

  socket.on("typing", async (data: { chatId: string; userId: string; isTyping: boolean }) => {
    const user = await User.findById(data.userId).select("username");
    if (user) {
      socket.to(data.chatId).emit("user_typing", { 
        userId: data.userId, 
        username: user.username,
        isTyping: data.isTyping 
      });
    }
  });
  
  socket.on("leave_chat", (chatId: string) => {
    socket.leave(chatId);
    if (socket.userId) {
       socket.to(chatId).emit("user_left", { userId: socket.userId });
    }
  });
};
