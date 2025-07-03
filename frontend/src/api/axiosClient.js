// File: frontend/src/api/axiosClient.js
import axios from "axios";

const base = import.meta.env.VITE_BACKEND_BASE;

const axiosClient = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true,
});

export default axiosClient;
