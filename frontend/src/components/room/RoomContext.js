import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiGetRoomDetails } from '../../API/apiService';

const RoomContext = createContext();

export const useRoom = () => useContext(RoomContext);

export const RoomProvider = ({ children }) => {
  const { roomID } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const data = await apiGetRoomDetails(roomID);
        setRoomDetails(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomID]);

  return (
    <RoomContext.Provider value={{ roomID, roomDetails, loading, error }}>
      {children}
    </RoomContext.Provider>
  );
};
