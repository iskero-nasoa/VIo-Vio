import { Server, Socket } from "socket.io";
import { prisma } from "../config/prisma";

interface SocketWithUser extends Socket {
  userId?: string;
}

const activeCalls = new Map<string, any>();

export const setupCallSocket = (io: Server, socket: SocketWithUser) => {
  if (!socket.userId) return;

  socket.on(
    "initiate_call",
    async (data: { receiverId: string; type: "audio" | "video"; offer: any }) => {
      const callerId = socket.userId!;

      const caller = await prisma.user.findUnique({
        where: { id: callerId },
        select: { username: true, avatar: true },
      });
      if (!caller) return;

      const callLog = await prisma.callLog.create({
        data: { callerId, receiverId: data.receiverId, type: data.type, status: "missed" },
      });

      activeCalls.set(callLog.id, {
        callerId,
        receiverId: data.receiverId,
        type: data.type,
      });

      io.to(`user_${data.receiverId}`).emit("incoming_call", {
        callId: callLog.id,
        callerId,
        callerUsername: caller.username,
        callerAvatar: caller.avatar,
        type: data.type,
        offer: data.offer,
      });

      socket.emit("call_initiated", { callId: callLog.id });
    }
  );

  socket.on("answer_call", async (data: { callId: string; answer: any; accept: boolean }) => {
    const call = activeCalls.get(data.callId);
    if (!call) return;

    if (!data.accept) {
      await prisma.callLog.update({
        where: { id: data.callId },
        data: { status: "rejected", endedAt: new Date() },
      });
      io.to(`user_${call.callerId}`).emit("call_rejected", { callId: data.callId });
      activeCalls.delete(data.callId);
      return;
    }

    call.startTime = Date.now();
    await prisma.callLog.update({ where: { id: data.callId }, data: { status: "answered" } });
    io.to(`user_${call.callerId}`).emit("webrtc_answer", { callId: data.callId, answer: data.answer });
  });

  socket.on("ice_candidate", (data: { callId: string; candidate: any; to: string }) => {
    const call = activeCalls.get(data.callId);
    if (!call) return;
    const targetId = data.to || (socket.userId === call.callerId ? call.receiverId : call.callerId);
    io.to(`user_${targetId}`).emit("ice_candidate", {
      callId: data.callId,
      candidate: data.candidate,
      from: socket.userId,
    });
  });

  socket.on("end_call", async (data: { callId: string }) => {
    const call = activeCalls.get(data.callId);
    if (!call) return;

    const duration = call.startTime ? Math.floor((Date.now() - call.startTime) / 1000) : 0;
    await prisma.callLog.update({
      where: { id: data.callId },
      data: { status: "ended", duration, endedAt: new Date() },
    });

    const otherUserId = socket.userId === call.callerId ? call.receiverId : call.callerId;
    io.to(`user_${otherUserId}`).emit("call_ended", { callId: data.callId, duration });
    activeCalls.delete(data.callId);
  });

  socket.on("toggle_audio", (data: { callId: string; muted: boolean }) => {
    const call = activeCalls.get(data.callId);
    if (!call) return;
    const other = socket.userId === call.callerId ? call.receiverId : call.callerId;
    io.to(`user_${other}`).emit("peer_toggle_audio", data);
  });

  socket.on("toggle_video", (data: { callId: string; videoOff: boolean }) => {
    const call = activeCalls.get(data.callId);
    if (!call) return;
    const other = socket.userId === call.callerId ? call.receiverId : call.callerId;
    io.to(`user_${other}`).emit("peer_toggle_video", data);
  });
};
