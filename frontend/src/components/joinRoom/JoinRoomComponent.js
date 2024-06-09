import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, styled } from '@mui/material';
import axios from 'axios';
import localStorageAPI from '../../API/localStorageAPI';


const backendUrl = process.env.REACT_APP_BACKEND_URL;

const FormContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  maxWidth: '400px',
  margin: '0 auto',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
});

const JoinRoomComponent = () => {
  const { roomID } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(roomID || '');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userdata = localStorageAPI.getItem('userdata');
    if (userdata) {
      setName(userdata.name);
      setProfilePic(userdata.profilePicture);
    }
  }, []);

  const handleJoinRoom = async () => {
    try {
      await axios.post(`${backendUrl}/join_room/${room}`, null, {
        params: {
          name: name,
          profile_pic: profilePic,
        },
      });
      navigate(`/room/${room}`);
    } catch (err) {
      setError('Failed to join the room. Please try again.');
    }
  };

  return (
    <FormContainer>
      <Typography variant="h4" gutterBottom>
        Join Room
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        fullWidth
      />
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />
      <TextField
        label="Profile Picture"
        value={profilePic}
        onChange={(e) => setProfilePic(e.target.value)}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleJoinRoom}>
        Join Room
      </Button>
    </FormContainer>
  );
};

export default JoinRoomComponent;
