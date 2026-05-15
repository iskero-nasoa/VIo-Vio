/**
 * Request Logger Middleware
 * Uses Morgan to log HTTP requests.
 */

const morgan = require('morgan');

// Custom format for Morgan
const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

const requestLogger = morgan(format);

module.exports = { requestLogger };
