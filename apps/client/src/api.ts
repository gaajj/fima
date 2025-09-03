import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => (accessToken = t);

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
