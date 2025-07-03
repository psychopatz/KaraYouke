import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { joinSession } from "../api/userApi";
import socket from "../socket/socket";
import AvatarSelector from "../components/AvatarSelector";
import ConnectedUsersList from "../components/ConnectedUsersList";
import RoleSelector from "../components/RoleSelector";
import useSessionSocket from "../hooks/useSessionSocket";

const AVATAR_PATH = "/Avatars/";

const SessionTest = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [monitorName, setMonitorName] = useState("");
  const [remoteName, setRemoteName] = useState("");
  const [avatarIndex, setAvatarIndex] = useState("1");
  const [role, setRole] = useState("monitor");
  const [users, setUsers] = useState([]);

  useSessionSocket(setUsers);

  const handleCreateSession = async () => {
    const res = await axiosClient.post("/session/create");
    const code = res.data.session_code;
    setSessionCode(code);

    const id = "monitor_" + Date.now();
    const avatar_url = `${AVATAR_PATH}${avatarIndex}.svg`;

    await joinSession({ session_code: code, id, name: monitorName, avatar_base64: avatar_url });
    socket.emit("join_room", code, () => {
      socket.emit("register_user", { id });
    });
  };

  const handleJoinSession = async () => {
    const id = "remote_" + Date.now();
    const avatar_url = `${AVATAR_PATH}${avatarIndex}.svg`;

    await joinSession({ session_code: sessionCode, id, name: remoteName, avatar_base64: avatar_url });
    socket.emit("join_room", sessionCode, () => {
      socket.emit("register_user", { id });
    });
  };

  const handleKick = (id) => {
    socket.emit("kick_user", { session_code: sessionCode, id });
  };

  return (
    <div style={{ padding: "2rem", color: "#fff", background: "#222", minHeight: "100vh", fontFamily: "Arial" }}>
      <h2>🎤 Karayouke Session Test</h2>
      <RoleSelector role={role} setRole={setRole} />

      {role === "monitor" ? (
        <>
          <h3>🎬 Monitor</h3>
          <input placeholder="Enter Monitor Name" value={monitorName} onChange={(e) => setMonitorName(e.target.value)} />
          <br />
          <AvatarSelector avatarIndex={avatarIndex} setAvatarIndex={setAvatarIndex} />
          <br />
          <button onClick={handleCreateSession}>Create Session</button>
          {sessionCode && <p>Session Code: <strong>{sessionCode}</strong></p>}
          {users.length > 0 && <ConnectedUsersList users={users} onKick={handleKick} />}
        </>
      ) : (
        <>
          <h3>🎮 Remote</h3>
          <input placeholder="Enter Session Code" value={sessionCode} onChange={(e) => setSessionCode(e.target.value)} />
          <br />
          <input placeholder="Enter Your Name" value={remoteName} onChange={(e) => setRemoteName(e.target.value)} />
          <br />
          <AvatarSelector avatarIndex={avatarIndex} setAvatarIndex={setAvatarIndex} />
          <br />
          <button onClick={handleJoinSession}>Join Session</button>
        </>
      )}
    </div>
  );
};

export default SessionTest;
