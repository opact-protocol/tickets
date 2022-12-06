import axios from "axios";

export const api = axios.create({
  baseURL: "http://seal-app-xcfqc.ondigitalocean.app",
});

export default api;
