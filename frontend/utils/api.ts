import axios, { AxiosError } from "axios";
import { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth";

// Инициализация axios с базовым URL
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

// Добавляем JWT токен в заголовок Authorization для каждого запроса
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Обрабатываем ошибки API централизованно
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // Если получаем 401 Unauthorized, можно автоматически разлогинить пользователя
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
    }

    const message = error.response?.data?.message || "Произошла ошибка при обращении к API";
    return Promise.reject(new Error(message));
  }
);

export const api = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", {
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },

  getMe: async (): Promise<AuthResponse["user"]> => {
    const { data } = await apiClient.get<AuthResponse["user"]>("/auth/me");
    return data;
  },

  // Заглушки для методов чата (будут реализованы с Socket.io)
  getChats: async () => {
    const { data } = await apiClient.get("/chats");
    return data;
  },

  createDirectChat: async (targetUserId: string) => {
    const { data } = await apiClient.post("/chats/create-direct", { targetUserId });
    return data;
  },

  getMessages: async (chatId: string, skip: number = 0, limit: number = 50) => {
    const { data } = await apiClient.get(`/messages/${chatId}`, {
      params: { skip, limit }
    });
    return data;
  },

  deleteMessage: async (messageId: string) => {
    const { data } = await apiClient.delete(`/messages/${messageId}`);
    return data;
  },

  uploadFile: async (file: File, onProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
    });
    return data;
  },

  getUsers: async () => {
    const { data } = await apiClient.get("/auth/users");
    return data;
  },

  getUserProfile: async (userId: string) => {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
  },

  updateProfile: async (payload: any) => {
    const { data } = await apiClient.patch("/users/me", payload);
    return data;
  },

  uploadAvatar: async (file: File, onProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await apiClient.put("/users/me/avatar", formData, {
      onUploadProgress: onProgress,
    });
    return data;
  },

  searchUsers: async (query: string) => {
    const { data } = await apiClient.get(`/users/search`, {
      params: { q: query },
    });
    return data;
  },
};
