const isDev = process.env.NODE_ENV === 'development';

export function log(message, data = null) {
  if (isDev) {
    console.log(`[${new Date().toLocaleTimeString()}] LOG: ${message}`, data || '');
  }
}

export function error(message, err = null) {
  if (isDev) {
    console.error(`[${new Date().toLocaleTimeString()}] ERROR: ${message}`, err || '');
    if (err?.stack) console.error(err.stack);
  }
}

export function warn(message, data = null) {
  if (isDev) {
    console.warn(`[${new Date().toLocaleTimeString()}] WARN: ${message}`, data || '');
  }
}
