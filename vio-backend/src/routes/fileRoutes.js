const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');
const { createAttachmentObject } = require('../utils/helpers');

router.use(verifyToken);

/**
 * POST /api/files/upload
 * Accept a single file and return its metadata
 */
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Create standardised attachment metadata
    const attachment = createAttachmentObject(req.file);

    // Add unique fileId (using filename as base)
    attachment.fileId = req.file.filename.split('.')[0];

    res.status(200).json(attachment);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;
