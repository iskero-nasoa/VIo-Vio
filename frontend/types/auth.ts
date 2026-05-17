export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
}
