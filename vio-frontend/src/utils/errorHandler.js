/**
 * User-friendly API error handling
 */
export function handleApiError(error) {
  if (!error.response) {
    return "Network error. Please check your internet connection.";
  }

  const status = error.response.status;
  const message = error.response.data?.error || error.response.data?.message;

  if (message) return message;

  switch (status) {
    case 400: return "Invalid request. Please check your input.";
    case 401: return "Your session expired. Please login again.";
    case 403: return "You don't have permission for this action.";
    case 404: return "Resource not found.";
    case 409: return "This item already exists.";
    case 422: return "Validation failed.";
    case 500: return "Server error. Please try again later.";
    default: return "Something went wrong. Please try again.";
  }
}

export function handleSocketError(error) {
  console.error("Socket Error:", error);
  return "Real-time connection lost. Reconnecting...";
}

export function handleFileUploadError(error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return "File is too large (max 10MB).";
  }
  return "Failed to upload file. Please try again.";
}
