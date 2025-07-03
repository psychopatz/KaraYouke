// File: frontend/src/hooks/useBackendScanner.js
import { useEffect, useState } from "react";
import { scanAndSetBackend } from "../utils/autoConnectScanner";

export default function useBackendScanner() {
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState(sessionStorage.getItem("karayouke_backend_url") || "");

  useEffect(() => {
    const check = async () => {
      if (!backendUrl) {
        const found = await scanAndSetBackend();
        setBackendUrl(found);
      }
      setLoading(false);
    };

    check();
  }, []);

  return { backendUrl, loading };
}
