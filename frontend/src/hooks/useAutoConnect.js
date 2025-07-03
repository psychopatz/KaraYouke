// File: frontend/src/hooks/useAutoConnect.js
import { useEffect } from "react";
import { joinSession } from "../api/userApi";
import socket from "../socket/socket";

const USER_ID = "test-user-id";
const USER_NAME = "Test User";

export default function useAutoConnect(sessionCode) {
  useEffect(() => {
    const connect = async () => {
      if (!sessionCode) return;

      try {
        await joinSession({
          session_code: sessionCode,
          id: USER_ID,
          name: USER_NAME,
          avatar_base64: "",
        });

        socket.emit("join_room", sessionCode);
        socket.emit("register_user", {
          session_code: sessionCode,
          id: USER_ID,
        });

        console.log("✅ Auto-connected to session:", sessionCode);
      } catch (err) {
        console.error("❌ Failed to join session:", err);
      }
    };

    connect();
  }, [sessionCode]);
}
