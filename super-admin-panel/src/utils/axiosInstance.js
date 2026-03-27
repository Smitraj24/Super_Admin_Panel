import axios from "axios";
import { API_BASE } from "./constants";

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

axiosInstance.interce ptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
