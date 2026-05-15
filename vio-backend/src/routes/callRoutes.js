const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// POST /api/calls/initiate — Start a call
router.post('/initiate', callController.initiateCall);

// POST /api/calls/:callId/accept — Accept incoming call
router.post('/:callId/accept', callController.acceptCall);

// POST /api/calls/:callId/reject — Reject incoming call
router.post('/:callId/reject', callController.rejectCall);

// POST /api/calls/:callId/end — End active call
router.post('/:callId/end', callController.endCall);

// GET /api/calls/history — User call logs
router.get('/history', callController.getCallHistory);

// GET /api/calls/ongoing — Active/Ringing calls
router.get('/ongoing', callController.getOngoingCalls);

// POST /api/calls/:callId/signaling — WebRTC signaling relay
router.post('/:callId/signaling', callController.sendCallSignalingData);

module.exports = router;
