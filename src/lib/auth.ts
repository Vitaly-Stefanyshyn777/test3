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
  certificate?: string;
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
): Promise<UserResponse> => {
  const registerData = {
    username: credentials.username,
    email: credentials.email,
    password: credentials.password,
    first_name: credentials.first_name,
    last_name: credentials.last_name,
    roles: credentials.roles || ["bfb_coach"],
    meta: {
      phone: credentials.phone,
      input_text_position: "Фітнес тренер",
      input_text_experience: "0",
      input_text_locations_city: "Київ",
      input_text_locations_country: "Україна",
      input_text_social_telegram: "",
      input_text_social_phone: credentials.phone,
      input_text_social_instagram: "",
      input_text_boards: "0",
      textarea_super_power: "",
      point_data_favourite_exercise: [],
      point_data_my_specialty: [],
      hl_data_my_experience: [],
      hl_data_my_wlocation: [],
      certificate: credentials.certificate,
      ...credentials.meta,
    },
  };

  try {
    // Через адмінський канал: проксі підтягне Authorization з httpOnly кукі (bfb_admin_jwt)
    const response = await adminRequest({
      method: "POST",
      url: "/api/proxy?path=" + encodeURIComponent("/wp-json/wp/v2/users"),
      data: registerData,
    });
    return response.data as UserResponse;
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
    if (process.env.NODE_ENV !== "production") {
      console.debug("[auth.getMyProfile] OK", {
        hasToken: !!authToken,
        status: response.status,
      });
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const status = (error as unknown as { response?: { status?: number } })
        ?.response?.status;
      console.debug("[auth.getMyProfile] FAIL", {
        hasToken:
          typeof window !== "undefined" && !!localStorage.getItem("bfb_token"),
        status,
      });
    }

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
