import React, { useState } from 'react';
import { Box, CircularProgress, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { RoomProvider, useRoom } from './RoomContext';
import RoomDrawer from './RoomDrawer';

const RoomContent = () => {
  const { loading, error } = useRoom();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error fetching room details: {error.message}</Typography>;
  }

  return (
    <Box p={3} display="flex">
      <IconButton onClick={handleDrawerToggle}>
        <MenuIcon />
      </IconButton>
      <RoomDrawer drawerOpen={drawerOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box flexGrow={1}>
        <Typography variant="h4">Room Content Here</Typography>
      </Box>
    </Box>
  );
};

const RoomComponent = () => (
  <RoomProvider>
    <RoomContent />
  </RoomProvider>
);

export default RoomComponent;
