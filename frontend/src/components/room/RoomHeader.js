import React from 'react';
import { Typography, Box } from '@mui/material';
import QrCodeGenerator from '../qr/QrCodeGenerator';
import { useRoom } from './RoomContext';

const RoomHeader = () => {
  const { roomID } = useRoom();
  const frontEndUrl = process.env.REACT_APP_FRONTEND_URL;

  return (
    <Box mb={2}>
      <Typography variant="h4" gutterBottom>
        Room: {roomID}
      </Typography>
      <QrCodeGenerator text={`${frontEndUrl}/join-room/${roomID}`} size={256} />
    </Box>
  );
};

export default RoomHeader;
