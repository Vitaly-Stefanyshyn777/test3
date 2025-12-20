import api, { adminRequest } from "./api";
import axios from "axios";

const adminApi = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  certificate: string; // Обов'язкове поле - реєстрація без сертифікату заборонена
  roles?: string[];
  meta?: Record<string, unknown>;
}

export interface UserResponse {
  id: number;
  name: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  roles?: string[];
  meta?: Record<string, unknown>;
}

// Відповідь від кастомного ендпоінту реєстрації
export interface CustomRegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: UserResponse;
    certificate?: {
      // Структура сертифікату з бекенду
      [key: string]: unknown;
    };
    token?: string; // Можливо, токен також повертається
  };
}

export interface TrainerApplicationCredentials {
  name: string;
  phone?: string;
  email?: string;
  instagram?: string;
  comment?: string;
  nickname?: string;
}

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  try {
    // Використовуємо адмінський канал через проксі: якщо немає кукі — інтерцептор зробить /api/admin-login і ретрайнеться
    const response = await adminRequest({
      method: "POST",
      url:
        "/api/proxy?path=" +
        encodeURIComponent("/wp-json/jwt-auth/v1/token"),
      data: {
        username: credentials.username,
        password: credentials.password,
      },
    });

    try {
      await fetch("/api/set-user-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: (response.data as LoginResponse).token }),
      });
    } catch {}
    return response.data as LoginResponse;
  } catch (error) {
    throw error;
  }
};

export const register = async (
  credentials: RegisterCredentials
): Promise<CustomRegisterResponse> => {
  // Використовуємо кастомний ендпоінт для реєстрації
  const registerData = {
    username: credentials.username,
    email: credentials.email,
    password: credentials.password,
    certificate_code: credentials.certificate, // Використовуємо certificate_code замість certificate
    first_name: credentials.first_name,
    last_name: credentials.last_name,
    roles: credentials.roles || ["bfb_coach"],
  };

  try {
    // Через адмінський канал: проксі підтягне Authorization з httpOnly кукі (bfb_admin_jwt)
    const response = await adminRequest({
      method: "POST",
      url: "/api/proxy?path=" + encodeURIComponent("/wp-json/custom/v2/users"),
      data: registerData,
    });
    
    const customResponse = response.data as CustomRegisterResponse;
    
    // Перевіряємо, чи реєстрація була успішною
    if (!customResponse.success) {
      throw new Error(customResponse.message || "Помилка реєстрації");
    }
    
    return customResponse;
  } catch (error) {
    throw error;
  }
};

export const refresh = async (): Promise<UserResponse> => {
  throw new Error("Refresh not implemented");
};

type WPUserMe = {
  id?: number;
  name?: string;
  email?: string;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  slug?: string;
  avatar?: string;
  avatar_urls?: Record<string, string>;
  meta?: Record<string, unknown>;
};

export const getMyProfile = async (token?: string | null): Promise<WPUserMe | null> => {
  try {
    // Спочатку пробуємо використати токен з параметра, потім з localStorage
    let authToken: string | null = token || null;
    
    if (!authToken && typeof window !== "undefined") {
      try {
        authToken = localStorage.getItem("bfb_token");
      } catch {}
    }

    const response = await api.get("/api/proxy", {
      params: { path: "/wp-json/wp/v2/users/me?context=edit" },
      headers: authToken
        ? {
            Authorization: `Bearer ${authToken}`,
          }
        : undefined,
    });
    return response.data;
  } catch (error) {

    return null;
  }
};

export const submitTrainerApplication = async (
  credentials: TrainerApplicationCredentials
): Promise<{ success: boolean; message: string }> => {
  try {
    const payload = {
      name: credentials.name,
      email: credentials.email,
      phone: credentials.phone,
      nickname: credentials.nickname || credentials.instagram,
      question: credentials.comment,
    };

    const { data } = await adminApi.post(
      "/api/applications/training",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    throw error;
  }
};
