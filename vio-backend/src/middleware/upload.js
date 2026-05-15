const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateUniqueFilename, sanitizeFilename } = require('../utils/helpers');

// Ensure upload directories exist
const uploadDirs = ['uploads/avatars', 'uploads/messages', 'uploads/temp'];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 [Upload] Created directory: ${dir}`);
  }
});

// Max sizes in bytes
const MAX_SIZES = {
  IMAGE_VIDEO: 50 * 1024 * 1024, // 50MB
  AUDIO: 20 * 1024 * 1024,       // 20MB
  DOCUMENT: 25 * 1024 * 1024,    // 25MB
};

const ALLOWED_EXTENSIONS = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.webp'],
  VIDEOS: ['.mp4', '.webm'],
  AUDIO: ['.mp3', '.wav'],
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt'],
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/messages/';
    if (file.fieldname === 'avatar') dest = 'uploads/avatars/';
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    cb(null, generateUniqueFilename(sanitized));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allAllowed = [
    ...ALLOWED_EXTENSIONS.IMAGES,
    ...ALLOWED_EXTENSIONS.VIDEOS,
    ...ALLOWED_EXTENSIONS.AUDIO,
    ...ALLOWED_EXTENSIONS.DOCUMENTS,
  ];

  if (!allAllowed.includes(ext)) {
    return cb(new Error(`File type ${ext} is not allowed.`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZES.IMAGE_VIDEO, // Upper bound (50MB)
  },
});

module.exports = upload;
