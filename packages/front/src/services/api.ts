import axios from "axios";

export const api = axios.create({
  baseURL: "https://seal-app-xcfqc.ondigitalocean.app/",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Request-Headers": "Access-Control-Request-Headers",
  },
});

export default api;
