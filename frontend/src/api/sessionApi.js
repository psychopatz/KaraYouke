// src/api/sessionApi.js

import axiosClient from "./axiosClient";

/**
 * Sends a request to the backend to create a new session.
 * @returns {Promise<{status: string, session_code: string}>} The session data.
 */
export const createSession = async () => {
  try {
    const response = await axiosClient.post("/session/create");
    return response.data;
  } catch (error) {
    console.error("Failed to create session:", error);
    // You might want to throw the error to be handled by the component
    throw error;
  }
};