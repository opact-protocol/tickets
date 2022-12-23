import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_RELAYER,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

export default api;
