import { validateEmail, validatePassword, validateUsername } from '../../utils/validators';

describe('Validators', () => {
  describe('validateEmail', () => {
    test('should return valid for correct email', () => {
      expect(validateEmail('test@example.com').valid).toBe(true);
    });

    test('should return error for invalid email', () => {
      expect(validateEmail('invalid-email').valid).toBe(false);
      expect(validateEmail('test@').valid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should return valid for strong password', () => {
      expect(validatePassword('password123').valid).toBe(true);
      expect(validatePassword('pass!word').valid).toBe(true);
    });

    test('should return error for short password', () => {
      expect(validatePassword('123').valid).toBe(false);
    });
  });

  describe('validateUsername', () => {
    test('should return valid for correct username', () => {
      expect(validateUsername('john_doe123').valid).toBe(true);
    });

    test('should return error for invalid characters', () => {
      expect(validateUsername('john-doe').valid).toBe(false);
      expect(validateUsername('john doe').valid).toBe(false);
    });
  });
});
