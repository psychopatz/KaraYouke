// File: frontend/src/socket/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  withCredentials: true,
  transports: ["polling", "websocket"],
});

export default socket;
