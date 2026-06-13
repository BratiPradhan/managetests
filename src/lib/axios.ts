import axios from "axios";
import { getToken } from "@/lib/auth";

const apiClient = axios.create({
  // Same-origin path — proxied to BACKEND_API_URL via the rewrite in next.config.ts
  // so the browser never makes a cross-origin request (avoids CORS).
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
