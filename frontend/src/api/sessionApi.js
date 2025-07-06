// src/api/sessionApi.js

import axiosClient from "./axiosClient";

/**
 * Sends a request to the backend to create a new session.
 * @param {object} payload - The request payload.
 * @param {string|null} payload.password - The optional password for the session.
 * @returns {Promise<{status: string, session_code: string}>} The session data.
 */
// MODIFIED: The function now accepts an object with a password and sends it as the request body.
export const createSession = async ({ password }) => {
  try {
    // The second argument to post() is the request body.
    // It must match the Pydantic model in the backend.
    const response = await axiosClient.post("/session/create", { password });
    return response.data;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw error;
  }
};

export const deleteSession = async (sessionCode) => {
  try {
    const response = await axiosClient.delete(`/session/${sessionCode}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete session ${sessionCode}:`, error);
    throw error;
  }
};

/**
 * Validates a session and checks if it requires a password.
 * @param {string} sessionCode The 5-digit session code.
 * @returns {Promise<{valid: boolean, password_required: boolean}>} An object with validation status.
 */
// MODIFIED: This now returns the full response object from the backend.
export const validateSession = async (sessionCode) => {
  try {
    const response = await axiosClient.get(`/session/validate/${sessionCode}`);
    // The backend now returns { "valid": boolean, "password_required": boolean }
    // We return the whole data object for the component to use.
    return response.data;
  } catch (error) {
    console.error("Error validating session:", error);
    // If there's any error, assume the session is invalid and not password protected.
    return { valid: false, password_required: false };
  }
};