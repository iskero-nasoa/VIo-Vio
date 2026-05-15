/**
 * Message Validation Middleware
 *
 * Validates message payloads before they reach the controller:
 *   - messageType must be a valid enum value
 *   - content length ≤ 4000 characters
 *   - attachments array ≤ 10 items
 *   - emoji in reactions must be a non-empty string
 */

const VALID_MESSAGE_TYPES = ['text', 'image', 'video', 'audio', 'file', 'call'];
const MAX_CONTENT_LENGTH = 4000;
const MAX_ATTACHMENTS = 10;

const validateMessage = (req, res, next) => {
  try {
    const { content, messageType, attachments } = req.body;

    // ── messageType validation ────────────────────────
    if (messageType && !VALID_MESSAGE_TYPES.includes(messageType)) {
      return res.status(400).json({
        error: `Invalid message type "${messageType}". Allowed: ${VALID_MESSAGE_TYPES.join(', ')}`,
      });
    }

    // ── content length validation ─────────────────────
    if (content && content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({
        error: `Content cannot exceed ${MAX_CONTENT_LENGTH} characters. Current: ${content.length}`,
      });
    }

    // ── attachments count validation ──────────────────
    if (Array.isArray(attachments) && attachments.length > MAX_ATTACHMENTS) {
      return res.status(400).json({
        error: `A message can have a maximum of ${MAX_ATTACHMENTS} attachments. Received: ${attachments.length}`,
      });
    }

    next();
  } catch (error) {
    console.error('validateMessage middleware error:', error);
    res.status(500).json({ error: 'An error occurred during message validation' });
  }
};

/**
 * Validate emoji field in reaction requests
 */
const validateReaction = (req, res, next) => {
  try {
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== 'string' || emoji.trim().length === 0) {
      return res.status(400).json({ error: 'A valid emoji string is required' });
    }

    // Basic emoji length sanity check (most emoji are 1-4 code points)
    if (emoji.length > 16) {
      return res.status(400).json({ error: 'Emoji value is too long' });
    }

    next();
  } catch (error) {
    console.error('validateReaction middleware error:', error);
    res.status(500).json({ error: 'An error occurred during reaction validation' });
  }
};

module.exports = { validateMessage, validateReaction };
