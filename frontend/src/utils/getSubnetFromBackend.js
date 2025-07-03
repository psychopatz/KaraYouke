// File: frontend/src/utils/getSubnetFromBackend.js

import axios from "axios";

export const getSubnetFromBackend = async () => {
  try {
    console.log("🌐 Getting subnet from backend...");
    const res = await axios.get("http://127.0.0.1:8000/api/debug/host_ip", { timeout: 500 });
    const ip = res.data?.host_ip;
    if (!ip) return null;

    const parts = ip.split(".");
    return parts.slice(0, 3).join(".");
  } catch (err) {
    console.error("❌ Error fetching subnet:", err.message);
    return null;
  }
};
