import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import localStorageAPI from '../../API/localStorageAPI';
import { apiCreateRoom } from '../../API/apiService';
import QRCodeComponent from '../qr/QRCodeComponent';

// Helper function to generate random 8-character string
const generateRandomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const CreateRoomComponent = () => {
  const navigate = useNavigate();
  const user = localStorageAPI.getItem('userdata');
  const [roomID, setRoomID] = useState(generateRandomCode());
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleCreateRoom = async () => {
    if (!roomID) {
      setAlertMessage('Room ID is required');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    try {
      const data = await apiCreateRoom(roomID, user.name, user.profilePicture);

      setAlertMessage(data.message);
      setAlertSeverity('success');
      setAlertOpen(true);
      navigate(`/room/${roomID}`);
    } catch (error) {
      setAlertMessage(error.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleRegenerateCode = () => {
    setRoomID(generateRandomCode());
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h4" gutterBottom>
        Create Room
      </Typography>
      {/* <QRCodeComponent text={`${backendUrl}/room/${roomID}`} size={256} /> */}
      <Box width="30%" textAlign="center">
        <TextField
          label="Room ID"
          variant="outlined"
          disabled
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="secondary" onClick={handleRegenerateCode} fullWidth>
          Regenerate
        </Button>
        <Button variant="contained" color="primary" onClick={handleCreateRoom} fullWidth sx={{ mt: 2 }}>
          Create
        </Button>
      </Box>
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateRoomComponent;
