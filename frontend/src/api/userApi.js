// File: frontend/src/api/userApi.js
import axiosClient from "./axiosClient";

export const joinSession = async ({ session_code, id, name, avatar_base64 }) => {
  const response = await axiosClient.post("/user/join", {
    session_code,
    id,
    name,
    avatar_base64,
  });
  return response.data;
};
