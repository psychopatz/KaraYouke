// File: frontend/src/hooks/useLanScanner.js
import { useState, useRef } from "react";
import axios from "axios";
import { getSubnetFromBackend } from "../utils/getSubnetFromBackend";
import { setAxiosBaseUrl } from "../api/axiosClient";

const PORTS = [8000];
const TIMEOUT = 700;
const BATCH_SIZE = 50;

export default function useLanScanner() {
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const cancelRef = useRef(false);

  const cancelScan = () => {
    console.log("🛑 Scan cancelled.");
    cancelRef.current = true;
    setScanning(false);
  };

  const scan = async () => {
    cancelRef.current = false;
    setResults([]);
    setScanning(true);

    const subnet = await getSubnetFromBackend();
    if (!subnet) {
      console.warn("⚠️ Subnet unavailable.");
      setScanning(false);
      return [];
    }

    const candidates = [];
    for (let i = 1; i <= 254; i++) {
      for (let port of PORTS) {
        candidates.push(`http://${subnet}.${i}:${port}`);
      }
    }

    const found = [];

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      if (cancelRef.current) break;

      const batch = candidates.slice(i, i + BATCH_SIZE);
      const settled = await Promise.allSettled(
        batch.map(async (url) => {
          try {
            const res = await axios.get(`${url}/api/session/ping`, { timeout: TIMEOUT });
            if (res.data?.status === "OK") return url;
          } catch {}
          return null;
        })
      );

      for (const r of settled) {
        if (cancelRef.current) break;
        if (r.status === "fulfilled" && r.value) {
          console.log("✅ Found backend:", r.value);
          found.push(r.value);
        }
      }
    }

    setResults(found);
    setScanning(false);
    return found;
  };

  const selectBackend = (url) => {
    sessionStorage.setItem("karayouke_backend_url", url);
    setAxiosBaseUrl(url);
    console.log("✔️ Backend selected:", url);
  };

  return {
    scanning,
    results,
    scan,
    cancelScan,
    selectBackend,
  };
}
