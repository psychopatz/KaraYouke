// File: frontend/src/pages/SessionTest.jsx
import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { joinSession } from "../api/userApi";
import socket from "../socket/socket";

const AVATAR_PATH = "/Avatars/";

const SessionTest = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [monitorName, setMonitorName] = useState("");
  const [remoteName, setRemoteName] = useState("");
  const [avatarIndex, setAvatarIndex] = useState("1");
  const [role, setRole] = useState("monitor");
  const [users, setUsers] = useState([]);

  const handleCreateSession = async () => {
    try {
      const res = await axiosClient.post("/session/create");
      const code = res.data.session_code;
      setSessionCode(code);

      const id = "monitor_" + Date.now();
      const avatar_url = `${AVATAR_PATH}${avatarIndex}.svg`;

      await joinSession({ session_code: code, id, name: monitorName, avatar_base64: avatar_url });
      socket.emit("join_room", code);
      socket.emit("register_user", { id });

      console.log("Monitor joined session:", code);
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  const handleJoinSession = async () => {
    try {
      const id = "remote_" + Date.now();
      const avatar_url = `${AVATAR_PATH}${avatarIndex}.svg`;

      await joinSession({ session_code: sessionCode, id, name: remoteName, avatar_base64: avatar_url });
      socket.emit("join_room", sessionCode);
      socket.emit("register_user", { id });

      console.log("Remote joined session:", sessionCode);
    } catch (err) {
      console.error("Join error:", err);
    }
  };

  useEffect(() => {
    socket.on("users_updated", (newUsers) => {
      setUsers(newUsers);
    });

    return () => {
      socket.off("users_updated");
    };
  }, []);

  return (
    <div style={{ padding: "2rem", color: "#fff", background: "#222", minHeight: "100vh", fontFamily: "Arial" }}>
      <h2>🎤 Karayouke Session Test</h2>

      <div>
        <label>
          Select Role:{" "}
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="monitor">Monitor</option>
            <option value="remote">Remote</option>
          </select>
        </label>
      </div>

      {role === "monitor" ? (
        <>
          <h3>🎬 Monitor</h3>
          <input
            placeholder="Enter Monitor Name"
            value={monitorName}
            onChange={(e) => setMonitorName(e.target.value)}
          />
          <br />
          <label>
            Avatar:
            <select value={avatarIndex} onChange={(e) => setAvatarIndex(e.target.value)}>
              {[...Array(21).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  Avatar {i + 1}
                </option>
              ))}
            </select>
          </label>
          <br />
          <button onClick={handleCreateSession}>Create Session</button>
          {sessionCode && <p>Session Code: <strong>{sessionCode}</strong></p>}

          {users.length > 0 && (
            <div>
              <h4>👥 Connected Users</h4>
              <ul>
                {users.map((u) => (
                  <li key={u.id}>
                    <img src={u.avatar_base64} alt="avatar" width={32} style={{ verticalAlign: "middle" }} />{" "}
                    {u.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          <h3>🎮 Remote</h3>
          <input
            placeholder="Enter Session Code"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
          />
          <br />
          <input
            placeholder="Enter Your Name"
            value={remoteName}
            onChange={(e) => setRemoteName(e.target.value)}
          />
          <br />
          <label>
            Avatar:
            <select value={avatarIndex} onChange={(e) => setAvatarIndex(e.target.value)}>
              {[...Array(21).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  Avatar {i + 1}
                </option>
              ))}
            </select>
          </label>
          <br />
          <button onClick={handleJoinSession}>Join Session</button>
        </>
      )}
    </div>
  );
};

export default SessionTest;
