// File: frontend/src/components/SocketTest.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  withCredentials: true,
  transports: ["polling", "websocket"]
});

// Dummy user
const USER_ID = "test-user-id";
const USER_NAME = "Test User";

const SocketTest = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [lastUser, setLastUser] = useState("None yet");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("join_remote", (user) => {
      setLastUser(user.name);
    });

    socket.on("users_updated", (users) => {
      setUsers(users);
      console.log("🧑‍🤝‍🧑 Users updated:", users);
    });

    return () => {
      socket.off("join_remote");
      socket.off("users_updated");
    };
  }, []);

  const handleJoinRoom = async () => {
    if (!sessionCode) return;

    // 1. Call backend API to join
    await fetch("http://localhost:8000/api/user/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_code: sessionCode,
        id: USER_ID,
        name: USER_NAME,
        avatar_base64: "" // Placeholder for now
      })
    });

    // 2. Join socket room and register
    socket.emit("join_room", sessionCode);
    socket.emit("register_user", {
      session_code: sessionCode,
      id: USER_ID
    });

    setJoined(true);
  };

  const handleLogout = () => {
    if (!sessionCode) return;

    socket.emit("logout_user", {
      session_code: sessionCode,
      id: USER_ID
    });

    setJoined(false);
    setUsers([]);
    setLastUser("None yet");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", color: "white", background: "#222", minHeight: "100vh" }}>
      <h2>🎤 Karayouke Socket.IO Test</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>Session Code: </label>
        <input
          type="text"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          placeholder="Enter Session Code"
          style={{ padding: "0.5rem", marginRight: "1rem" }}
        />
        <button onClick={handleJoinRoom} disabled={joined}>
          Join Room
        </button>
        <button onClick={handleLogout} disabled={!joined} style={{ marginLeft: "1rem" }}>
          Logout
        </button>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h4>👤 Last User Joined:</h4>
        <p>{lastUser}</p>
      </div>

      <div>
        <h4>📋 All Users in Session:</h4>
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SocketTest;
