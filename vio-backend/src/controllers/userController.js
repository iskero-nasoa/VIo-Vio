const User = require('../models/User');
const { notifyUserStatusChange } = require('../services/notificationService');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ error: 'An error occurred while fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { avatar, statusMessage, phoneNumber, status } = req.body;
    
    const updateData = {};

    if (avatar !== undefined) updateData.avatar = avatar;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    
    if (statusMessage !== undefined) {
      if (statusMessage.length > 150) {
        return res.status(400).json({ error: 'Status message must be under 150 characters' });
      }
      updateData.statusMessage = statusMessage;
    }

    if (status !== undefined) {
      const allowedStatuses = ['online', 'offline', 'away'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be online, offline, or away.' });
      }
      updateData.status = status;
    }

    // Only update if there is something to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId || req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'An error occurred while updating profile' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json([]);
    }

    // Search by username or email. Case-insensitive regex.
    const regex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      $or: [{ username: regex }, { email: regex }],
      _id: { $ne: req.user.userId || req.user.id } // Exclude the current user from results
    })
    .limit(20)
    .select('-password -email'); // Exclude sensitive fields for privacy

    res.status(200).json(users);
  } catch (error) {
    console.error('searchUsers error:', error);
    res.status(500).json({ error: 'An error occurred while searching users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ error: 'An error occurred while fetching user profile' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['online', 'offline', 'away'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be online, offline, or away.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId || req.user.id,
      { status, lastSeen: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Broadcast status change to chat peers
    notifyUserStatusChange(req.user.userId || req.user.id, status)
      .catch((err) => console.error('notifyUserStatusChange error:', err.message));

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('updateStatus error:', error);
    res.status(500).json({ error: 'An error occurred while updating status' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // The upload middleware already handles the generation of filename
    // and storing it in the uploads/avatars/ directory. It also checks
    // if the extension is an allowed image.
    
    // We just need to check if the file size exceeded the avatar max size (5MB).
    // The middleware general limit is 50MB, so we validate here.
    if (req.file.size > 5 * 1024 * 1024) {
      // In a real application, you'd also delete the newly saved file using fs.unlinkSync
      return res.status(400).json({ error: 'Avatar file size must be less than 5MB' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.userId || req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl 
    });
  } catch (error) {
    console.error('uploadAvatar error:', error);
    // If multer throws an error (e.g. invalid file type from fileFilter), it comes here
    res.status(400).json({ error: error.message || 'An error occurred while uploading avatar' });
  }
};
