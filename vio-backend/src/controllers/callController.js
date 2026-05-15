const Call = require('../models/Call');
const User = require('../models/User');
const Chat = require('../models/Chat');
const { emitToUser } = require('../websocket/socketManager');
const { WS_EVENTS, CALL_DUPLICATE_WINDOW_MS } = require('../config/constants');
const { notifyIncomingCall, notifyMissedCall } = require('../services/notificationService');

// ─── Helper ────────────────────────────────────────────
const getUserId = (req) => (req.user.userId || req.user.id).toString();

/**
 * Initiate an audio call
 * POST /api/calls/initiate
 */
exports.initiateCall = async (req, res) => {
  try {
    const { recipientId, chatId } = req.body;
    const initiatorId = getUserId(req);

    // Default call type to audio (video removed as requested)
    const callType = 'audio';

    if (recipientId && recipientId === initiatorId) {
      return res.status(400).json({ error: 'You cannot call yourself' });
    }

    // Duplicate prevention
    const recentCall = await Call.findOne({
      initiatorId,
      status: 'ringing',
      createdAt: { $gte: new Date(Date.now() - CALL_DUPLICATE_WINDOW_MS) },
    });
    if (recentCall) {
      return res.status(429).json({ error: 'A call was already initiated recently' });
    }

    let targetChat;
    let participantIds = [];

    if (chatId) {
      targetChat = await Chat.findById(chatId);
      if (!targetChat) return res.status(404).json({ error: 'Chat not found' });
      participantIds = targetChat.members
        .map((m) => m.toString())
        .filter((id) => id !== initiatorId);
    } else if (recipientId) {
      const recipient = await User.findById(recipientId);
      if (!recipient) return res.status(404).json({ error: 'Recipient not found' });
      
      targetChat = await Chat.findOne({
        chatType: 'direct',
        members: { $all: [initiatorId, recipientId] },
      });
      if (!targetChat) {
        targetChat = await Chat.create({
          chatType: 'direct',
          members: [initiatorId, recipientId],
        });
      }
      participantIds = [recipientId];
    } else {
      return res.status(400).json({ error: 'recipientId or chatId required' });
    }

    const call = await Call.create({
      callType,
      initiatorId,
      participantIds,
      chatId: targetChat._id,
      status: 'ringing',
    });

    const populated = await call.populate('initiatorId', 'username avatar');

    // Emit to participants
    participantIds.forEach((pid) => {
      emitToUser(pid, WS_EVENTS.INCOMING_CALL, {
        callId: call._id,
        callType,
        chatId: targetChat._id,
        initiator: {
          userId: initiatorId,
          username: populated.initiatorId.username,
          avatar: populated.initiatorId.avatar,
        },
      });
    });

    // Persistent Notification
    participantIds.forEach(pid => {
      notifyIncomingCall(pid, call._id, populated.initiatorId.username)
        .catch(err => console.error('notifyIncomingCall error:', err));
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error('initiateCall error:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
};

/**
 * Accept a call
 * POST /api/calls/:callId/accept
 */
exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = getUserId(req);

    const call = await Call.findById(callId);
    if (!call) return res.status(404).json({ error: 'Call not found' });
    if (call.status !== 'ringing') return res.status(400).json({ error: 'Call is not ringing' });

    call.status = 'active';
    call.startTime = new Date();
    await call.save();

    emitToUser(call.initiatorId.toString(), WS_EVENTS.CALL_ACCEPTED, { callId, acceptedBy: userId });
    
    res.status(200).json(call);
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept call' });
  }
};

/**
 * Reject a call
 * POST /api/calls/:callId/reject
 */
exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = getUserId(req);

    const call = await Call.findById(callId);
    if (!call) return res.status(404).json({ error: 'Call not found' });

    call.status = 'ended';
    call.endTime = new Date();
    call.endReason = 'rejected';
    await call.save();

    emitToUser(call.initiatorId.toString(), WS_EVENTS.CALL_REJECTED, { callId, rejectedBy: userId });
    
    res.status(200).json({ message: 'Call rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject call' });
  }
};

/**
 * End a call
 * POST /api/calls/:callId/end
 */
exports.endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = getUserId(req);

    const call = await Call.findById(callId);
    if (!call) return res.status(404).json({ error: 'Call not found' });
    if (['ended', 'missed', 'rejected'].includes(call.status)) {
      return res.status(400).json({ error: 'Call already finished' });
    }

    call.status = 'ended';
    call.endTime = new Date();
    await call.save();

    const recipients = [call.initiatorId, ...call.participantIds].filter(id => id.toString() !== userId);
    recipients.forEach(id => {
      emitToUser(id.toString(), WS_EVENTS.CALL_ENDED, { callId, endedBy: userId, duration: call.duration });
    });

    res.status(200).json(call);
  } catch (error) {
    res.status(500).json({ error: 'Failed to end call' });
  }
};

/**
 * Get call history
 * GET /api/calls/history
 */
exports.getCallHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    const calls = await Call.find({
      $or: [{ initiatorId: userId }, { participantIds: userId }]
    }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(calls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

/**
 * Get ongoing calls
 * GET /api/calls/ongoing
 */
exports.getOngoingCalls = async (req, res) => {
  try {
    const userId = getUserId(req);
    const calls = await Call.find({
      $or: [{ initiatorId: userId }, { participantIds: userId }],
      status: { $in: ['ringing', 'active'] }
    });
    res.status(200).json(calls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ongoing calls' });
  }
};

/**
 * WebRTC Signaling (Required even for simplified calls)
 */
exports.sendCallSignalingData = async (req, res) => {
  try {
    const { callId } = req.params;
    const { signalingData, targetParticipantId } = req.body;
    const userId = getUserId(req);

    emitToUser(targetParticipantId, WS_EVENTS.CALL_SIGNALING, {
      callId,
      from: userId,
      signalingData
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Signaling failed' });
  }
};
