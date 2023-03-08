import { useEnv } from "@/hooks/useEnv";
import axios from "axios";

export const relayer = axios.create({
  baseURL: useEnv("VITE_RELAYER_URL"),
  headers: {
    "Content-Type": "application/json",
  },
});

export const geoApi = axios.create({
  baseURL: "https://get.geojs.io/v1/",
});
