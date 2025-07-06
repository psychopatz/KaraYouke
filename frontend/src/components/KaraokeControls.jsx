import React from 'react';
import { Box, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';

const ControlsWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  marginTop: theme.spacing(4),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius * 5,
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'opacity 0.3s ease-in-out', // Smooth transition for opacity
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // This rule applies the faded look when the button is disabled
  '&.Mui-disabled': {
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

// --- THIS IS THE CORRECTED COMPONENT ---
const KaraokeControls = ({ isPlaying, onPlayPause, onNext, isPlayPauseDisabled = false, isNextDisabled = false }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <ControlsWrapper 
        elevation={8}
        // Lower the opacity on the whole container for a clearer visual cue
        sx={{ opacity: isPlayPauseDisabled ? 0.6 : 1 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          
          <Tooltip title={isPlayPauseDisabled ? "No song playing" : (isPlaying ? 'Pause' : 'Play')}>
            {/* The span is necessary for Tooltip to work correctly on a disabled button */}
            <span>
              <StyledIconButton 
                  aria-label="play/pause" 
                  onClick={onPlayPause}
                  size="large"
                  // The 'disabled' prop is what actually makes the button unclickable
                  disabled={isPlayPauseDisabled}
              >
                {isPlaying ? <PauseIcon sx={{ fontSize: 40 }} /> : <PlayArrowIcon sx={{ fontSize: 40 }} />}
              </StyledIconButton>
            </span>
          </Tooltip>
          
          <Tooltip title={isNextDisabled ? "No song up next" : "Next Song"}>
            <span>
              <StyledIconButton 
                  aria-label="next song" 
                  onClick={onNext}
                  size="large"
                  // The 'disabled' prop is what actually makes the button unclickable
                  disabled={isNextDisabled}
              >
                <SkipNextIcon sx={{ fontSize: 40 }} />
              </StyledIconButton>
            </span>
          </Tooltip>

        </Stack>
      </ControlsWrapper>
    </Box>
  );
};

export default KaraokeControls;