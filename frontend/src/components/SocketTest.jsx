import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  withCredentials: true,
  transports: ["polling", "websocket"]
});


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
    });

    return () => {
      socket.off("join_remote");
      socket.off("users_updated");
    };
  }, []);

  const handleJoinRoom = () => {
    if (!sessionCode) return;
    socket.emit("join_room", sessionCode);
    setJoined(true);
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
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h4>📥 Last User Joined:</h4>
        <p>{lastUser}</p>
      </div>

      <div>
        <h4>👥 All Users in Session:</h4>
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
