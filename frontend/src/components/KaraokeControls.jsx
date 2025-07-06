// src/components/KaraokeControls.jsx
import React from 'react';
import { Box, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';

// A styled container for the controls, matching the "glass" theme
const ControlsWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 3), // Vertical and horizontal padding
  marginTop: theme.spacing(4),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius * 5, // Make it pill-shaped
  display: 'inline-flex', // Let it size to its content
  justifyContent: 'center',
  alignItems: 'center',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const KaraokeControls = ({ isPlaying, onPlayPause, onNext }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <ControlsWrapper elevation={8}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
            <StyledIconButton 
                aria-label="play/pause" 
                onClick={onPlayPause}
                size="large"
            >
              {isPlaying ? <PauseIcon sx={{ fontSize: 40 }} /> : <PlayArrowIcon sx={{ fontSize: 40 }} />}
            </StyledIconButton>
          </Tooltip>
          
          <Tooltip title="Next Song">
            <StyledIconButton 
                aria-label="next song" 
                onClick={onNext}
                size="large"
            >
              <SkipNextIcon sx={{ fontSize: 40 }} />
            </StyledIconButton>
          </Tooltip>
        </Stack>
      </ControlsWrapper>
    </Box>
  );
};

export default KaraokeControls;