import axios, { type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    token =
      localStorage.getItem("bfb_token") ||
      localStorage.getItem("bfb_token_old");
  }

  const isJwtTokenEndpoint = (config.url || "").includes(
    "/wp-json/jwt-auth/v1/token"
  );

  const wantsAdmin =
    !!config.headers &&
    ((config.headers as unknown as Record<string, string>)[
      "x-internal-admin"
    ] === "1" ||
      (config.headers as unknown as Record<string, string>)[
        "X-Internal-Admin"
      ] === "1");

  if (!isJwtTokenEndpoint && config.headers && !wantsAdmin) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (process.env.NODE_ENV !== "production") {
        console.debug("[api.request] add Authorization", {
          url: config.url,
          method: config.method,
          admin: wantsAdmin,
        });
      }
    } else if (process.env.NODE_ENV !== "production") {
      console.debug("[api.request] no token available", {
        url: config.url,
        method: config.method,
        admin: wantsAdmin,
      });
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      const config =
        error?.config as import("axios").InternalAxiosRequestConfig & {
          _adminRetry?: boolean;
        };

      const status = error?.response?.status as number | undefined;
      const wantsAdmin =
        !!config?.headers &&
        (config.headers["x-internal-admin"] === "1" ||
          config.headers["X-Internal-Admin"] === "1");

      if (process.env.NODE_ENV !== "production") {
        console.debug("[api.response.error]", {
          url: config?.url,
          method: config?.method,
          status,
          admin: wantsAdmin,
          hasAuthHeader: !!config?.headers?.Authorization,
        });
      }

      if (
        wantsAdmin &&
        (status === 401 || status === 403) &&
        !config?._adminRetry
      ) {
        await fetch("/api/admin-login", { method: "POST" });
        const newConfig = { ...config, _adminRetry: true };
        return api.request(newConfig);
      }
    } catch {}

    return Promise.reject(error);
  }
);

export default api;

export type RequestConfig = InternalAxiosRequestConfig;

export const userRequest = (config: Partial<RequestConfig>, token?: string) => {
  let authToken = token || null;
  if (!authToken && typeof window !== "undefined") {
    authToken =
      localStorage.getItem("bfb_token") ||
      localStorage.getItem("bfb_token_old");
  }

  const headers = { ...(config.headers || {}) } as Record<string, string>;
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  return api.request({ ...(config as RequestConfig), headers });
};

export const adminRequest = (config: Partial<RequestConfig>) => {
  const headers = {
    ...(config.headers || {}),
    "x-internal-admin": "1",
  } as Record<string, string>;
  return api.request({ ...(config as RequestConfig), headers });
};
