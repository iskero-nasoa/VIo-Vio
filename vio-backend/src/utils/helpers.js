const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Generates a JWT token
 * @param {string} userId - The user's ID
 * @param {string} email - The user's email
 * @returns {string} - Signed JWT token
 */
const generateToken = (userId, email) => {
  try {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Expires in 7 days as requested
    );
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
};

/**
 * Hashes a password using bcryptjs
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compares a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
const comparePasswords = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Failed to compare passwords');
  }
};

/**
 * Validates an email format using regex
 * @param {string} email - Email string to validate
 * @returns {boolean} - True if valid
 */
const validateEmail = (email) => {
  try {
    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a password meets minimum requirements
 * @param {string} password - Password string to validate
 * @returns {boolean} - True if valid (min 6 characters)
 */
const validatePassword = (password) => {
  try {
    if (!password) return false;
    return password.length >= 6;
  } catch (error) {
    return false;
  }
};

// Exporting formatUser from previous setup for consistency, if needed elsewhere
const formatUser = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatar,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
  };
};

const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Creates a unique filename with UUID and original extension
 * @param {string} originalName 
 * @returns {string}
 */
const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  return `${uuidv4()}${ext}`;
};

/**
 * Checks if a file type is allowed
 * @param {string} filename 
 * @param {string[]} allowedTypes (extensions like '.jpg', '.png')
 * @returns {boolean}
 */
const validateFileType = (filename, allowedTypes) => {
  const ext = path.extname(filename).toLowerCase();
  return allowedTypes.includes(ext);
};

/**
 * Checks if file size is within limit
 * @param {number} fileSize in bytes
 * @param {number} maxSize in bytes
 * @returns {boolean}
 */
const validateFileSize = (fileSize, maxSize) => {
  return fileSize <= maxSize;
};

/**
 * Removes special characters and spaces from filename
 * @param {string} filename 
 * @returns {string}
 */
const sanitizeFilename = (filename) => {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '');
  return `${sanitizedName}${ext}`;
};

// ─── Message Helpers ────────────────────────────────────

/**
 * Formats a populated message document for API response
 * @param {Object} message - Mongoose message document (populated)
 * @returns {Object}
 */
const formatMessageResponse = (message) => {
  try {
    return {
      messageId: message._id,
      chatId: message.chatId,
      sender: message.senderId
        ? {
            userId: message.senderId._id,
            username: message.senderId.username,
            avatar: message.senderId.avatar,
          }
        : null,
      content: message.content,
      messageType: message.messageType,
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      replyTo: message.replyTo || null,
      topicId: message.topicId || null,
      createdAt: message.createdAt,
    };
  } catch (error) {
    console.error('formatMessageResponse error:', error);
    return message;
  }
};

/**
 * Calculates total message size including attachments
 * @param {Object} message
 * @returns {number} size in bytes
 */
const calculateMessageSize = (message) => {
  try {
    // Text content size (UTF-8 rough estimate)
    let size = Buffer.byteLength(message.content || '', 'utf8');

    // Sum attachment sizes
    if (Array.isArray(message.attachments)) {
      for (const att of message.attachments) {
        size += att.size || 0;
      }
    }

    return size;
  } catch (error) {
    console.error('calculateMessageSize error:', error);
    return 0;
  }
};

/**
 * Ensures a message has either text content or at least one attachment
 * @param {string} content
 * @param {Array} attachments
 * @returns {boolean}
 */
const validateMessageContent = (content, attachments) => {
  const hasContent = content && content.trim().length > 0;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
  return hasContent || hasAttachments;
};

/**
 * Determines attachment type category from a filename extension
 * @param {string} filename
 * @returns {string} 'image' | 'video' | 'audio' | 'document' | 'file'
 */
const getAttachmentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();

  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];
  const videoExts = ['.mp4', '.webm', '.avi', '.mov', '.mkv'];
  const audioExts = ['.mp3', '.wav', '.ogg', '.aac', '.m4a'];
  const docExts = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (docExts.includes(ext)) return 'document';
  return 'file';
};

/**
 * Creates a standardised attachment metadata object from a multer file
 * @param {Object} file - multer file object
 * @returns {Object} { type, url, filename, size }
 */
const createAttachmentObject = (file) => {
  try {
    const type = getAttachmentType(file.originalname);
    return {
      type,
      url: `/uploads/messages/${file.filename}`,
      filename: file.originalname,
      size: file.size,
    };
  } catch (error) {
    console.error('createAttachmentObject error:', error);
    throw new Error('Failed to create attachment object');
  }
};

module.exports = {
  generateToken,
  hashPassword,
  comparePasswords,
  validateEmail,
  validatePassword,
  formatUser,
  generateUniqueFilename,
  validateFileType,
  validateFileSize,
  sanitizeFilename,
  formatMessageResponse,
  calculateMessageSize,
  validateMessageContent,
  getAttachmentType,
  createAttachmentObject,
};
