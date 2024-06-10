import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { RoomProvider } from "../songQueue/RoomContext"; 
import DisplayPlayer from "./DisplayPlayer";
import DisplaySongQueue from '../songQueue/DisplaySongQueue';
import styled from '@emotion/styled';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RoomHeader from './RoomHeader';
import UserList from './UserList';
import localStorageAPI from '../../API/localStorageAPI';

const ContentContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1,
  pointerEvents: 'none',
});

const DrawerContent = styled(Box)({
  width: "auto",
  padding: 16,
  textAlign: 'center',
});




const ScrollableBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  maxHeight: 'calc(100vh - 200px)',  // Dynamic maxHeight based on viewport height
  minHeight: '200px',  // Minimum height to prevent squishing
  overflow: 'auto',
  '::-webkit-scrollbar': {
    width: '8px',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '4px',
  },
  '::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  }
});

const PlayerComponent = () => {
  const { roomID } = useParams();
  const [drawerOpen, setDrawerOpen] = useState(true);


  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <RoomProvider currentRoom={roomID}> 
      <ContentContainer>
        <DisplaySongQueue />
      </ContentContainer>
      <DisplayPlayer />
      <IconButton 
        onClick={toggleDrawer} 
        style={{ 
          position: 'fixed', 
          top: '50%', 
          left: 10, 
          zIndex: 3, 
          transform: 'translateY(-50%)' 
        }}
      >
        <MenuIcon style={{ color: 'white' }} />
      </IconButton>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          padding: '16px',
        }}
      >
        <DrawerContent>
            <Box p={2}>
              <RoomHeader />
              <Typography variant="h5" gutterBottom>
                Users:
              </Typography>
              <ScrollableBox>
                <UserList />
              </ScrollableBox>
            </Box>
        </DrawerContent>
      </Drawer>
    </RoomProvider>
  );
}

export default PlayerComponent;
