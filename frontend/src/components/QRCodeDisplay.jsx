// src/components/QRCodeDisplay.jsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import DynamicQRCode from './DynamicQRCode'; // <-- Import our new reusable component

const QRCodeContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
});

// The old QRWrapper component is no longer needed and can be deleted.

const QRCodeDisplay = ({ sessionCode }) => {
  if (!sessionCode) {
    return null;
  }

  const joinUrl = `${import.meta.env.VITE_FRONTEND_BASE}/join-room/${sessionCode}`;

  return (
    <QRCodeContainer>
      <Typography variant="h6">Scan to Join!</Typography>
      
      {/* Use the new dynamic component here */}
      <DynamicQRCode
        value={joinUrl}
        size={200}
        sx={{ boxShadow: 4 }} // We can pass MUI sx props for styling, like the shadow.
      />

      <Typography 
        variant="h4" 
        component="p"
        sx={{
          fontWeight: 'bold',
          letterSpacing: '0.2em',
          padding: '8px 16px',
          border: '1px solid grey',
          borderRadius: '4px',
        }}
      >
        {sessionCode}
      </Typography>
    </QRCodeContainer>
  );
};

export default QRCodeDisplay;