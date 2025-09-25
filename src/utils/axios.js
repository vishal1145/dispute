import axios from "axios";

// Base URL for your app (override with env if you like)
const BASE_URL = "https://dispute-mail.algofolks.com/users/api";
// const BASE_URL = "http://localhost:5000/api/users";

const TOKEN_KEY = "access_token";

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization: Bearer <token> to every request (unless skipAuth is set)
http.interceptors.request.use(
  (config) => {
    if (!config?.skipAuth && !config?.headers?.Authorization) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Pass-through responses/errors (keep it simple)
http.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);


export const setAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearAccessToken = () => localStorage.removeItem(TOKEN_KEY);

export default http;