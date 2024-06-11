import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;


export const apiGetRoomDetails = async (roomID) => {
  try {
    const response = await axios.get(`${backendUrl}/rooms/${roomID}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room details:', error);
    throw error;
  }
};

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

    console.log("API CreateRoom: ", response.data);

    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
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

    console.log("API JoinRoom: ", response.data);

    return response.data;
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

export const apiRemoveSongFromQueue = async (roomID, songID) => {
  try {
    const response = await axios.delete(`${backendUrl}/room/${roomID}/remove_song/${songID}`);

    console.log("API RemoveSongFromQueue: ", response.data);
    return response.data;
  } catch (error) {
    console.error('Error removing song from queue:', error);
    throw error;
  }
};

export const apiAddSongToQueue = async (roomID, userID, song) => {
  try {
    const response = await axios.post(`${backendUrl}/room/${roomID}/add_song`, song, {
      params: {
        user_id: userID
      }
    });

    console.log("API AddSongToQueue: ", response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding song to queue:', error);
    throw error;
  }
};