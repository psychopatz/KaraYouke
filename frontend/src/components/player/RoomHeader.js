import React, { useContext } from 'react';
import { Typography, Box } from '@mui/material';
import QrCodeGenerator from '../qr/QrCodeGenerator';
import { RoomContext } from '../songQueue/RoomContext';

const RoomHeader = () => {
  const frontEndUrl = process.env.REACT_APP_FRONTEND_URL;
  const { roomID } = useContext(RoomContext);

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
