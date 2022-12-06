import axios from "axios";

export const api = axios.create({
  baseURL: "https://seal-app-xcfqc.ondigitalocean.app/",
});

export default api;
