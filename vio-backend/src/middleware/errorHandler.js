/**
 * Global Error Handler Middleware
 * Standardizes all error responses across the API.
 */

const { NOTIFICATION_TYPES } = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  // Log error for developers
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(e => e.message);
  }

  // Handle Mongoose Cast Error (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle Duplicate Key Error (e.g., unique email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // Handle Authorization Errors
  if (err.name === 'AuthorizationError' || statusCode === 403) {
    statusCode = 403;
    message = err.message || 'Forbidden. You do not have permission to perform this action.';
  }

  // Handle Not Found Errors
  if (err.name === 'NotFoundError' || statusCode === 404) {
    statusCode = 404;
    message = err.message || 'Resource not found.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    }),
  });
};

module.exports = { errorHandler };
