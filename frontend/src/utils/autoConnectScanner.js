import axios from "axios";
import { setAxiosBaseUrl } from "../api/axiosClient";

const getSubnetFromHostIp = async () => {
  try {
    const localBase = "http://127.0.0.1:8000";
    console.log("ℹ️ Fetching host IP from backend...");

    const res = await axios.get(`${localBase}/api/debug/host_ip`, { timeout: 500 });
    const ip = res.data?.host_ip;

    if (!ip) {
      console.warn("⚠️ Could not retrieve host IP.");
      return null;
    }

    const parts = ip.split(".");
    const subnet = parts.slice(0, 3).join(".");
    console.log(`✅ Host IP: ${ip} → Subnet inferred: ${subnet}.x`);
    return subnet;
  } catch (err) {
    console.error("❌ Failed to get host IP from backend:", err.message);
    return null;
  }
};

export const scanAndSetBackend = async () => {
  const ports = [8000];
  const subnet = await getSubnetFromHostIp();
  if (!subnet) {
    console.warn("⚠️ Aborting scan — no subnet available.");
    return null;
  }

  console.log("🔍 Scanning IPs on subnet:", subnet);

  const candidates = [];
  for (let i = 1; i <= 254; i++) {
    for (let port of ports) {
      const url = `http://${subnet}.${i}:${port}`;
      candidates.push(url);
    }
  }

  for (let url of candidates) {
    try {
      const res = await axios.get(`${url}/api/session/ping`, { timeout: 500 });

      if (res.data?.status === "OK") {
        console.log(`🎯 Found backend at ${url}`);
        sessionStorage.setItem("karayouke_backend_url", url);
        setAxiosBaseUrl(url);
        return url;
      } else {
        console.log(`🛑 ${url} responded but not valid`);
      }
    } catch (err) {
      // Skip unreachable
      console.log(`⛔ No response from ${url}`);
    }
  }

  console.warn("🚫 No reachable backend found on subnet.");
  return null;
};
