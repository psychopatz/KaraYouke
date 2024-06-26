import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import localStorageAPI from '../../API/localStorageAPI';
import { apiCreateRoom } from '../../API/apiService';


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

  useEffect(() => {
    const userdata = localStorageAPI.getItem('userdata');
    if (!userdata) {
      navigate('/profile');
    }
  }, []);


  const handleCreateRoom = async () => {
    if (!roomID) {
      setAlertMessage('Room ID is required');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    try {
      const data = await apiCreateRoom(roomID, user.name, user.profilePicture);
      const newUser = {
        ...user,
        session: {
          roomID: data.roomID,
          sessionID: data.sessionID,
          type: data.type,
        },
      };
      localStorageAPI.setItem('userdata', newUser);

      setAlertMessage("Successfully created room: " + data.roomID);
      setAlertSeverity('success');
      setAlertOpen(true);
      navigate(`/play/${roomID}`);
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
