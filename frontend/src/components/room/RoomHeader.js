import React from 'react';
import { Typography, Box } from '@mui/material';
import QRCodeComponent from '../qr/QRCodeComponent';
import { useRoom } from './RoomContext';

const RoomHeader = () => {
  const { roomID } = useRoom();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  return (
    <Box mb={2}>
      <Typography variant="h4" gutterBottom>
        Room: {roomID}
      </Typography>
      <QRCodeComponent text={`${backendUrl}/room/${roomID}`} size={256} />
    </Box>
  );
};

export default RoomHeader;
