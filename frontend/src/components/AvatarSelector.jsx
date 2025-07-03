// src/components/AvatarSelector.jsx

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// --- STYLED COMPONENTS ---

const AvatarsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent background
  width: '100%',
}));

const AvatarGrid = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '16px',
  maxHeight: '250px', // Limit height and make it scrollable
  overflowY: 'auto',
  padding: '8px',
});

const AvatarPreview = styled('img')(({ theme, isSelected }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: '#333',
  padding: '4px',
  border: isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',

  '&:hover': {
    transform: 'scale(1.15)',
    boxShadow: `0 0 15px ${theme.palette.primary.light}`,
  },
}));

// --- COMPONENT LOGIC ---

const AvatarSelector = ({ selectedAvatar, onAvatarChange }) => {
  // Generate a list of avatar paths based on your public folder structure
  const AVATAR_COUNT = 21;
  const avatarPaths = Array.from(
    { length: AVATAR_COUNT },
    (_, i) => `/Avatars/${i + 1}.svg`
  );

  return (
    <AvatarsContainer elevation={4}>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Choose your Avatar
      </Typography>
      <AvatarGrid>
        {avatarPaths.map((path) => (
          <AvatarPreview
            key={path}
            src={path}
            alt={`Avatar ${path}`}
            isSelected={selectedAvatar === path}
            onClick={() => onAvatarChange(path)}
          />
        ))}
      </AvatarGrid>
    </AvatarsContainer>
  );
};

export default AvatarSelector;