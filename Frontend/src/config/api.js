import axios from "axios";

// In dev, default to local backend (Render has no EMAIL_* unless you set them there)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://fleet-backend-hb2j.onrender.com/api");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
