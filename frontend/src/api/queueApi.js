// src/api/queueApi.js
import axiosClient from './axiosClient';

export const addSongToQueue = async (sessionCode, song) => {
  // Return the data part of the response directly
  const response = await axiosClient.post('/queue/add', {
    session_code: sessionCode,
    song: song,
  });
  return response.data;
};

export const removeSongFromQueue = async (sessionCode, songId, userId) => {
  // Return the data part of the response directly
  const response = await axiosClient.post('/queue/remove', {
    session_code: sessionCode,
    song_id: songId,
    user_id: userId,
  });
  return response.data;
};