// File: frontend/src/components/LanScanner.jsx
import React, { useEffect, useState, useRef } from "react";
import useLanScanner from "../hooks/useLanScanner";

const LanScanner = ({ onSelect }) => {
  const { scan, results, scanning, cancelScan, selectBackend } = useLanScanner();
  const [selected, setSelected] = useState(sessionStorage.getItem("karayouke_backend_url") || "");

  const handleSelect = (url) => {
    selectBackend(url);
    setSelected(url);
    if (onSelect) onSelect(url);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", color: "white", background: "#111", minHeight: "100vh" }}>
      <h2>🛰️ Karayouke LAN Scanner</h2>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={scan} disabled={scanning} style={{ padding: "0.5rem 1rem", marginRight: "1rem" }}>
          {scanning ? "Scanning..." : "Scan for Servers"}
        </button>
        {scanning && (
          <button onClick={cancelScan} style={{ padding: "0.5rem 1rem", backgroundColor: "#ff4444", color: "#fff" }}>
            Cancel Scan
          </button>
        )}
      </div>

      {scanning && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          <div
            style={{
              width: 24,
              height: 24,
              border: "3px solid #00ff99",
              borderTop: "3px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginRight: "0.5rem",
            }}
          />
          <span>Scanning network...</span>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>

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

export default LanScanner;
