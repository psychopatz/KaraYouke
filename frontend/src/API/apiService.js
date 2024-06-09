import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const apiSearch = async (query, maxResults, page) => {
  try {
    const response = await axios.get(`${backendUrl}/search`, {
      params: {
        query: query,
        max_results: maxResults,
        page: page
      }
    });

    const data = response.data;
    return {
      results: data.results,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export const apiCreateRoom = async (roomID, name, profilePic) => {
  try {
    const response = await axios.post(`${backendUrl}/create_room/${roomID}`, null, {
      params: {
        name: name,
        profile_pic: profilePic
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const apiGetRoomDetails = async (roomID) => {
  try {
    const response = await axios.get(`${backendUrl}/rooms/${roomID}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room details:', error);
    throw error;
  }
};

export const apiJoinRoom = async (roomID, name, profilePic) => {
  try {
    const response = await axios.post(`${backendUrl}/join_room/${roomID}`, null, {
      params: {
        name: name,
        profile_pic: profilePic
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};
