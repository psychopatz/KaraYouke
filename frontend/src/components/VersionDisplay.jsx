// src/components/VersionDisplay.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const VersionContainer = styled(Box)({
  position: 'fixed',
  bottom: '5px',
  right: '10px',
  opacity: 0.5,
  zIndex: 1000,
  transition: 'opacity 0.3s',
  '&:hover': {
    opacity: 1,
  },
});

const VersionDisplay = () => {
  // Access the version variable injected by vite.config.js
  const appVersion = import.meta.env.VITE_APP_VERSION;

  // Only render the component if the version is available
  if (!appVersion || appVersion === 'unknown') {
    return null;
  }

  return (
    <VersionContainer>
      <Typography variant="caption" sx={{ color: 'grey.500' }}>
        v{appVersion}
      </Typography>
    </VersionContainer>
  );
};

export default VersionDisplay;