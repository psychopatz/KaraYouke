// src/hooks/useSessionSocket.js
import { useEffect } from "react";
import socket from "../socket/socket";

const useSessionSocket = (setUsers) => {
  useEffect(() => {
    socket.on("users_updated", setUsers);
    return () => socket.off("users_updated");
  }, [setUsers]);
};

export default useSessionSocket;
