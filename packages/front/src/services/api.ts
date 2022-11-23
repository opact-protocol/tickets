import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8081",
});

export default api;
