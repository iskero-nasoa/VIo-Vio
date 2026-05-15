const multer = require('multer');
const path = require('path');
const { generateUniqueFilename, sanitizeFilename, validateFileType, validateFileSize } = require('../utils/helpers');

// Max sizes in bytes
const MAX_SIZES = {
  AVATAR: 5 * 1024 * 1024,      // 5MB
  IMAGE_VIDEO: 50 * 1024 * 1024, // 50MB
  AUDIO: 20 * 1024 * 1024,       // 20MB
  DOCUMENT: 25 * 1024 * 1024,    // 25MB
};

const ALLOWED_TYPES = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.webp'],
  VIDEOS: ['.mp4', '.webm'],
  AUDIO: ['.mp3', '.wav'],
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt'],
};

// Map fields to their respective upload folders and validations
const getDestinationFolder = (fieldname) => {
  switch (fieldname) {
    case 'avatar': return 'uploads/avatars/';
    case 'message_attachment': return 'uploads/messages/';
    default: return 'uploads/temp/';
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = getDestinationFolder(file.fieldname);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const safeOriginal = sanitizeFilename(file.originalname);
    const uniqueName = generateUniqueFilename(safeOriginal);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  // We can validate file extension upfront
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'avatar') {
    if (!validateFileType(file.originalname, ALLOWED_TYPES.IMAGES)) {
      return cb(new Error('Invalid file type for avatar. Only jpg, png, webp allowed.'));
    }
  }

  // If we wanted to add message_attachment filter logic we could do so here,
  // but it usually supports images, videos, audio, and documents.
  cb(null, true); 
};

// Dynamic limit handling is tricky with a single Multer instance 
// but we set a safe overall maximum here, and validate specifics in controllers
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZES.IMAGE_VIDEO, // Overall upper cap (50MB)
  },
});

module.exports = upload;
