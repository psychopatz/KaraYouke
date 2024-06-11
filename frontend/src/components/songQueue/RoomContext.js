import React, { createContext, useState, useEffect } from 'react';
import { apiGetRoomDetails, apiRemoveSongFromQueue } from '../../API/apiService';
import localStorageAPI from '../../API/localStorageAPI';
import { useNavigate } from 'react-router-dom';

export const RoomContext = createContext();

export const RoomProvider = ({ children, currentRoom }) => {
  const [idleVideo] = useState("dQw4w9WgXcQ");
  const [roomID, setRoomID] = useState(currentRoom || null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPlaying, setCurrentPlaying] = useState(idleVideo);
  const [videoEnded, setVideoEnded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userdata = localStorageAPI.getItem('userdata');
    if (!userdata) {
      navigate('/profile');
    }
  }, [navigate]);

  const fetchRoomDetails = async (roomID, lastVersion = null) => {
    try {
      const data = await apiGetRoomDetails(roomID, lastVersion);
      setRoomData(data);
      setLoading(false);
      return data.song_queue.length; // Return the current version
    } catch (error) {
      setError(error);
      setLoading(false);
      throw error; // Throw the error to stop long polling on failure
    }
  };

  useEffect(() => {
    if (roomID) {
      const longPolling = async () => {
        let lastVersion = null;
        let retryCount = 0;
        while (true) {
          try {
            const version = await fetchRoomDetails(roomID, lastVersion);
            lastVersion = version; // Update lastVersion for the next request
            retryCount = 0; // Reset retry count on successful fetch
          } catch (error) {
            console.error('Error during long polling:', error);
            retryCount++;
            const waitTime = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff with a cap at 30 seconds
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      };

      longPolling();

      return () => {}; // Cleanup not needed for long polling
    }
  }, [roomID]);

  const handleIdlePlayer = () => {
    setCurrentPlaying(idleVideo);
  };

  const deleteFirstSongFromQueue = async () => {
    if (roomData && roomData.song_queue.length > 0) {
      const songID = roomData.song_queue[0].song_id;
      try {
        const data = await apiRemoveSongFromQueue(roomID, songID);
        console.log(data.message); // Handle the response as needed
        window.location.reload(); // Reload the website
      } catch (error) {
        console.error('Error deleting song from queue:', error);
      }
    }
  };

  useEffect(() => {
    if (!loading && roomData?.song_queue?.length > 0) {
      setCurrentPlaying(roomData.song_queue[0].url || idleVideo);
      console.log("roomData Received: ", roomData);
    } else {
      setCurrentPlaying(idleVideo);
      console.log("roomData: Not Received", roomData);
    }
  }, [loading, roomData]);

  return (
    <RoomContext.Provider value={{ roomData, loading, error, roomID, setRoomID, currentPlaying, setCurrentPlaying, deleteFirstSongFromQueue, videoEnded, setVideoEnded, handleIdlePlayer, idleVideo }}>
      {children}
    </RoomContext.Provider>
  );
};
