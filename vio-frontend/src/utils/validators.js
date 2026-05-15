export function validateUsername(username) {
  if (!username) return { valid: false, error: 'Username is required' };
  if (username.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
  if (username.length > 30) return { valid: false, error: 'Username must be less than 30 characters' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
}

export function validateEmail(email) {
  if (!email) return { valid: false, error: 'Email is required' };
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
}

export function validatePassword(password) {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
  if (!/\d/.test(password) && !/[!@#$%^&*]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number or special character' };
  }
  return { valid: true };
}

export function validatePhoneNumber(phone) {
  if (!phone) return { valid: true }; // Optional field
  const re = /^\+?[1-9]\d{1,14}$/;
  if (!re.test(phone)) return { valid: false, error: 'Invalid phone number format' };
  return { valid: true };
}
