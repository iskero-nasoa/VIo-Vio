import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import User from "../models/User";
import CallLog from "../models/CallLog";

interface SocketWithUser extends Socket {
  userId?: string;
}

const activeCalls = new Map<string, any>();

export const setupCallSocket = (io: Server, socket: SocketWithUser) => {
  if (!socket.userId) return;

  // Initiate a call
  socket.on(
    "initiate_call",
    async (data: { receiverId: string; type: "audio" | "video"; offer: any }) => {
      const callerId = socket.userId;
      if (!callerId) return;

      const caller = await User.findById(callerId);
      if (!caller) return;

      // Create a call log
      const callLog = await CallLog.create({
        callerId: new mongoose.Types.ObjectId(callerId),
        receiverId: new mongoose.Types.ObjectId(data.receiverId),
        type: data.type,
        status: "missed",
      });

      const callId = callLog._id.toString();

      activeCalls.set(callId, {
        callerId: callerId.toString(),
        receiverId: data.receiverId.toString(),
        type: data.type,
      });

      console.log(`☎️ Call initiated: ${callerId} -> ${data.receiverId} (ID: ${callId})`);

      // Notify the receiver
      io.to(`user_${data.receiverId.toString()}`).emit("incoming_call", {
        callId,
        callerId: callerId.toString(),
        callerUsername: caller.username,
        callerAvatar: caller.avatar,
        type: data.type,
        offer: data.offer,
      });

      // Confirm to caller
      socket.emit("call_initiated", { callId });
    }
  );

  // Answer a call
  socket.on(
    "answer_call",
    async (data: { callId: string; answer: any; accept: boolean }) => {
      const call = activeCalls.get(data.callId);
      if (!call) return;

      if (!data.accept) {
        // Rejecting
        await CallLog.findByIdAndUpdate(data.callId, {
          status: "rejected",
          endedAt: new Date(),
        });
        
        io.to(`user_${call.callerId.toString()}`).emit("call_rejected", {
          callId: data.callId,
        });
        
        activeCalls.delete(data.callId);
        return;
      }

      // Accepting
      call.startTime = Date.now();
      await CallLog.findByIdAndUpdate(data.callId, {
        status: "answered",
      });

      // Send answer to caller
      io.to(`user_${call.callerId.toString()}`).emit("webrtc_answer", {
        callId: data.callId,
        answer: data.answer,
      });
    }
  );

  // Relay ICE candidate
  socket.on(
    "ice_candidate",
    (data: { callId: string; candidate: any; to: string }) => {
      const call = activeCalls.get(data.callId);
      if (!call) return;

      const targetId = data.to || (socket.userId?.toString() === call.callerId.toString() ? call.receiverId : call.callerId);
      
      io.to(`user_${targetId.toString()}`).emit("ice_candidate", {
        callId: data.callId,
        candidate: data.candidate,
        from: socket.userId,
      });
    }
  );

  // End a call
  socket.on("end_call", async (data: { callId: string }) => {
    const call = activeCalls.get(data.callId);
    if (!call) return;

    const duration = call.startTime ? Math.floor((Date.now() - call.startTime) / 1000) : 0;

    await CallLog.findByIdAndUpdate(data.callId, {
      status: "ended",
      duration,
      endedAt: new Date(),
    });

    const otherUserId = socket.userId?.toString() === call.callerId.toString() ? call.receiverId : call.callerId;
    
    io.to(`user_${otherUserId.toString()}`).emit("call_ended", {
      callId: data.callId,
      duration,
    });

    activeCalls.delete(data.callId);
  });
  
  // Audio/Video toggle relays
  socket.on("toggle_audio", (data: { callId: string; muted: boolean }) => {
    const call = activeCalls.get(data.callId);
    if (!call) return;
    const otherUserId = socket.userId?.toString() === call.callerId.toString() ? call.receiverId : call.callerId;
    io.to(`user_${otherUserId.toString()}`).emit("peer_toggle_audio", data);
  });

  socket.on("toggle_video", (data: { callId: string; videoOff: boolean }) => {
    const call = activeCalls.get(data.callId);
    if (!call) return;
    const otherUserId = socket.userId?.toString() === call.callerId.toString() ? call.receiverId : call.callerId;
    io.to(`user_${otherUserId.toString()}`).emit("peer_toggle_video", data);
  });
};
