// File: frontend/src/socket/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_BASE, {
  withCredentials: true,
  transports: ["polling", "websocket"],
});

export default socket;
