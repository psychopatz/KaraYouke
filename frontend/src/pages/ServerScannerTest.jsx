// File: frontend/src/pages/ServerScannerTest.jsx
import React, { useState } from "react";
import axios from "axios";
import { setAxiosBaseUrl } from "../api/axiosClient";

const PORTS = [8000];
const TIMEOUT = 500;

const getBaseIp = () => {
  const parts = window.location.hostname.split(".");
  if (parts[0] === "localhost" || parts[0] === "127") return "192.168.0";
  return parts.slice(0, 3).join(".") || "192.168.0";
};

const scanAllServers = async () => {
  const baseIp = getBaseIp();
  const candidates = [];

  for (let i = 1; i <= 254; i++) {
    for (let port of PORTS) {
      candidates.push(`http://${baseIp}.${i}:${port}`);
    }
  }

  const found = [];

  for (let url of candidates) {
    try {
      const res = await axios.get(`${url}/api/session/ping`, { timeout: TIMEOUT });
      if (res.data?.status === "OK") {
        found.push(url);
        console.log("✅ Found:", url);
      }
    } catch {
      // Fail silently
    }
  }

  return found;
};

const ServerScannerTest = () => {
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [selected, setSelected] = useState(sessionStorage.getItem("karayouke_backend_url"));

  const handleScan = async () => {
    setScanning(true);
    const found = await scanAllServers();
    setResults(found);
    setScanning(false);
  };

  const handleSelect = (url) => {
    setAxiosBaseUrl(url);
    setSelected(url);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", color: "white", background: "#111", minHeight: "100vh" }}>
      <h2>🔌 Karayouke LAN Server Scanner</h2>

      <button onClick={handleScan} disabled={scanning} style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
        {scanning ? "Scanning..." : "Scan for Servers"}
      </button>

      <div>
        <strong>Currently selected backend:</strong>
        <div style={{ color: "#00ff99", marginBottom: "1rem" }}>
          {selected || "None yet"}
        </div>
      </div>

      <div>
        <h4>🌐 Found Servers:</h4>
        {results.length === 0 ? (
          <p>No servers found.</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {results.map((url) => (
              <li key={url} style={{ marginBottom: "1rem" }}>
                <code>{url}</code>
                <button
                  onClick={() => handleSelect(url)}
                  style={{
                    marginLeft: "1rem",
                    padding: "0.3rem 0.8rem",
                    backgroundColor: selected === url ? "#00ff99" : "#555",
                    color: "#000",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {selected === url ? "Selected" : "Use"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ServerScannerTest;
