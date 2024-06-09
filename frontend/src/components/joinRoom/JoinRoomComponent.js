import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Avatar, styled } from '@mui/material';
import localStorageAPI from '../../API/localStorageAPI';
import QrCodeScanner from '../qr/QrCodeScanner';
import { apiJoinRoom } from '../../API/apiService';

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

const UserFieldContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
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
      await apiJoinRoom(room, name, profilePic);
      navigate(`/room/${room}`);
    } catch (err) {
      setError('Failed to join the room. Please try again.');
    }
  };

  const handleScanSuccess = (decodedText, decodedResult) => {
    // Assuming the QR code contains a URL
    window.location.href = decodedText;
  };

  return (
    <FormContainer>
      <Typography variant="h4" gutterBottom>
        Join Room
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <UserFieldContainer>
        <Avatar src={profilePic} alt={name} sx={{ width: 56, height: 56 }} />
        <TextField
          label="Current User:"
          value={name}
          disabled
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
      </UserFieldContainer>
      <Typography variant="h6" gutterBottom>
        Scan Room Code
      </Typography>
      <QrCodeScanner onScanSuccess={handleScanSuccess} />
      <TextField
        label="Enter Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        fullWidth
      />
      
      <Button variant="contained" color="primary" onClick={handleJoinRoom}>
        Join Room
      </Button>
    </FormContainer>
  );
};

export default JoinRoomComponent;
