// File: frontend/src/api/axiosClient.js
import axios from "axios";

const defaultBase = sessionStorage.getItem("karayouke_backend_url") || "http://localhost:8000";

const axiosClient = axios.create({
  baseURL: `${defaultBase}/api`,
  withCredentials: true,
});

export const setAxiosBaseUrl = (base) => {
  sessionStorage.setItem("karayouke_backend_url", base);
  axiosClient.defaults.baseURL = `${base}/api`;
};

export default axiosClient;
