// File: frontend/src/utils/autoConnectScanner.js
import axios from "axios";
import { setAxiosBaseUrl } from "../api/axiosClient";

const getBaseIp = () => {
  const parts = window.location.hostname.split(".");
  if (parts[0] === "localhost" || parts[0] === "127") return "192.168.0";
  return parts.slice(0, 3).join(".") || "192.168.0";
};

export const scanAndSetBackend = async () => {
  const ports = [8000]; // You can add more if needed
  const baseIp = getBaseIp();
  const candidates = [];

  for (let i = 1; i <= 254; i++) {
    for (let port of ports) {
      candidates.push(`http://${baseIp}.${i}:${port}`);
    }
  }

  for (let url of candidates) {
    try {
      const res = await axios.get(`${url}/api/session/ping`, {
        timeout: 500,
      });

      if (res.data?.status === "OK") {
        setAxiosBaseUrl(url);
        console.log("✅ Backend found at", url);
        return url;
      }
    } catch (err) {
      // Ignore failed ping
    }
  }

  console.warn("❌ No backend found on LAN.");
  return null;
};
