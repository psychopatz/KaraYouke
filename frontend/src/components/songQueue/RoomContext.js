import React, { createContext, useState, useEffect } from 'react';
import { apiGetRoomDetails, apiRemoveSongFromQueue } from '../../API/apiService';

export const RoomContext = createContext();

export const RoomProvider = ({ children, currentRoom }) => {
  const [idleVideo] = useState("dQw4w9WgXcQ");
  const [roomID, setRoomID] = useState(currentRoom || null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPlaying, setCurrentPlaying] = useState(idleVideo);
  const [videoEnded, setVideoEnded] = useState(false);
  

  const fetchRoomDetails = async (roomID) => {
    try {
      const data = await apiGetRoomDetails(roomID);
      if (JSON.stringify(data) !== JSON.stringify(roomData)) {
        setRoomData(data);
      }
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

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
    if (roomID) {
      fetchRoomDetails(roomID);
      const interval = setInterval(() => {
        fetchRoomDetails(roomID);
      }, 2000); 

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [roomID]);

  useEffect(() => {
    if (!loading && roomData.song_queue && roomData.song_queue.length > 0) {
      setCurrentPlaying(roomData.song_queue[0].url || idleVideo);
      console.log("roomData Received: ",roomData);
    }else{
      setCurrentPlaying(idleVideo);
      console.log("roomData: Not Received",roomData);
    }
  }, [loading, roomData]);

  return (
    <RoomContext.Provider value={{ roomData, loading, error, roomID, setRoomID, currentPlaying, setCurrentPlaying, deleteFirstSongFromQueue,videoEnded, setVideoEnded, handleIdlePlayer,idleVideo }}>
      {children}
    </RoomContext.Provider>
  );
};
