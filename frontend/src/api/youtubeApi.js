// src/api/youtubeApi.js
import axiosClient from './axiosClient';

/**
 * Searches YouTube for karaoke videos with pagination support.
 * @param {object} params - The search parameters.
 * @param {string} params.query - The search term.
 * @param {number} params.limit - The number of results per page.
 * @param {number} params.page - The page number to fetch.
 * @returns {Promise<object>} The search results from the API.
 */
export const searchYoutube = async ({ query, limit, page }) => {
  try {
    const response = await axiosClient.get('/youtube/search', {
      params: {
        q: `${query} karaoke`, 
        limit,
        page, 
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching YouTube:", error);
    throw error;
  }
};