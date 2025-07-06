// File: frontend/src/api/userApi.js
import axiosClient from "./axiosClient";

export const joinSession = async ({ session_code, id, name, avatarBase64, password }) => {
  const response = await axiosClient.post("/user/join", {
    session_code,
    id,
    name,
    avatarBase64,
    password, 
  });
  return response.data;
};