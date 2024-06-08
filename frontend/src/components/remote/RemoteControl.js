import React from 'react';
import { Button, Grid } from '@mui/material';
import { styled } from '@mui/system';
import useWebSocket from '../../API/useWebSocket';

const ControlButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const RemoteControl = () => {
  const sendMessage = useWebSocket('ws://localhost:8000/ws/remote', () => {});

  const handleKeyPress = (direction) => {
    sendMessage(JSON.stringify({ type: 'navigate', direction }));
  };

  return (
    <Grid container justifyContent="center" alignItems="center" spacing={2}>
      <Grid item xs={12} container justifyContent="center">
        <ControlButton variant="contained" color="primary" onClick={() => handleKeyPress('up')}>
          Up
        </ControlButton>
      </Grid>
      <Grid item xs={12} container justifyContent="center">
        <ControlButton variant="contained" color="primary" onClick={() => handleKeyPress('left')}>
          Left
        </ControlButton>
        <ControlButton variant="contained" color="primary" onClick={() => handleKeyPress('enter')}>
          Enter
        </ControlButton>
        <ControlButton variant="contained" color="primary" onClick={() => handleKeyPress('right')}>
          Right
        </ControlButton>
      </Grid>
      <Grid item xs={12} container justifyContent="center">
        <ControlButton variant="contained" color="primary" onClick={() => handleKeyPress('down')}>
          Down
        </ControlButton>
      </Grid>
    </Grid>
  );
};

export default RemoteControl;
