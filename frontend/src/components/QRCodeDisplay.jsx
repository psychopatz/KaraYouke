// src/components/QRCodeDisplay.jsx

import React from 'react';
import QRCode from 'react-qr-code';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const QRCodeContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
});

// A white background is crucial for QR code scannability.
const QRWrapper = styled(Paper)({
  padding: '16px',
  backgroundColor: 'white',
  display: 'inline-block',
});

const QRCodeDisplay = ({ sessionCode }) => {
  if (!sessionCode) {
    return null;
  }

  // Construct the URL for the QR code
  const joinUrl = `${import.meta.env.VITE_FRONTEND_BASE}/join-room/${sessionCode}`;
  // NOTE: Changed from VITE_BACKEND_BASE. Users should be directed to your frontend join page.

  return (
    <QRCodeContainer>
      <Typography variant="h6">Scan to Join!</Typography>
      <QRWrapper elevation={4}>
        <QRCode
          value={joinUrl}
          size={200} // Adjust size as needed
        />
      </QRWrapper>
      <Typography 
        variant="h4" 
        component="p"
        sx={{
          fontWeight: 'bold',
          letterSpacing: '0.2em', // Spreads out the letters
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