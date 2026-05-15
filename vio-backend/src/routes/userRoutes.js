const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all routes
router.use(verifyToken);

// GET /api/users/profile
router.get('/profile', userController.getProfile);

// PUT /api/users/profile
router.put('/profile', userController.updateProfile);

// GET /api/users/search
router.get('/search', userController.searchUsers);

// GET /api/users/:userId
router.get('/:userId', userController.getUserById);

// PUT /api/users/status
router.put('/status', userController.updateStatus);

// POST /api/users/avatar
// 'avatar' must be the field name in multipart/form-data
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
