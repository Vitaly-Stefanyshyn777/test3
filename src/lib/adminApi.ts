import axios, { type InternalAxiosRequestConfig } from "axios";

const adminApi = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

adminApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const adminToken = process.env.NEXT_PUBLIC_BFB_TOKEN;

  if (adminToken && config.headers) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default adminApi;
