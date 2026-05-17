import { ValidationErrors, LoginPayload, RegisterPayload } from "@/types/auth";

export function validateEmail(email: string): string | undefined {
  if (!email) return "Email обязателен";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Некорректный формат email";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Пароль обязателен";
  if (password.length < 6) return "Пароль должен содержать минимум 6 символов";
  return undefined;
}

export function validateUsername(username: string): string | undefined {
  if (!username) return "Имя пользователя обязательно";
  if (username.length < 3)
    return "Имя пользователя должно содержать минимум 3 символа";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Имя пользователя может содержать только буквы, цифры и _";
  return undefined;
}

export function validateLoginForm(data: LoginPayload): ValidationErrors {
  const errors: ValidationErrors = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function validateRegisterForm(data: RegisterPayload): ValidationErrors {
  const errors: ValidationErrors = {};
  const usernameError = validateUsername(data.username);
  if (usernameError) errors.username = usernameError;
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  if (!data.confirmPassword) {
    errors.confirmPassword = "Подтверждение пароля обязательно";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Пароли не совпадают";
  }
  return errors;
}
