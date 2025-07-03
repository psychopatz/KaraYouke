// src/api/youtubeApi.js
import axiosClient from './axiosClient';

/**
 * Searches YouTube for karaoke videos.
 * @param {string} query The search term.
 * @param {number} limit The number of results to fetch.
 * @returns {Promise<object>} The search results from the API.
 */
export const searchYoutube = async (query, limit = 5) => {
  try {
    const response = await axiosClient.get('/youtube/search', {
      params: { q: `${query} karaoke`, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching YouTube:", error);
    throw error;
  }
};