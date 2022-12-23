import axios from "axios";

export const api = axios.create({
  baseURL: "https://walrus-app-juy4n.ondigitalocean.app/",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

export default api;
