/**
 * Startup Checks & Utilities
 * Verifies environment and prepares directory structure.
 */

const fs = require('fs');
const path = require('path');

/**
 * Ensures all required upload directories exist.
 */
const ensureUploadDirs = () => {
  const rootUploadDir = process.env.UPLOAD_DIR || 'uploads';
  const subDirs = ['avatars', 'attachments', 'temp'];

  [rootUploadDir, ...subDirs.map(d => path.join(rootUploadDir, d))].forEach(dir => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 [Startup] Created directory: ${dir}`);
    }
  });
};

/**
 * Validates that critical environment variables are set.
 */
const validateEnv = () => {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ [Startup] Missing critical environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
    console.warn('⚠️ [Startup] WARNING: You are using the default JWT_SECRET. Please change it in production!');
  }
};

module.exports = {
  ensureUploadDirs,
  validateEnv,
};
