import React from 'react';
import { Box, Drawer, IconButton, Typography, styled } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RoomHeader from './RoomHeader';
import UserList from './UserList';

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  justifyContent: 'flex-start',
}));

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

const RoomDrawer = ({ drawerOpen, handleDrawerToggle }) => (
  <Drawer
    variant="temporary"
    anchor="left"
    open={drawerOpen}
    onClose={handleDrawerToggle}
    ModalProps={{
      keepMounted: true, // Better open performance on mobile.
    }}
    sx={{ '& .MuiDrawer-paper': { overflow: 'hidden' } }} // Disable scroll for the drawer
  >
    <DrawerHeader>
      <IconButton onClick={handleDrawerToggle}>
        <MenuIcon />
      </IconButton>
      <Typography variant="h6">Room Details</Typography>
    </DrawerHeader>
    <Box p={2}>
      <RoomHeader />
      <Typography variant="h5" gutterBottom>
        Users:
      </Typography>
      <ScrollableBox>
        <UserList />
      </ScrollableBox>
    </Box>
  </Drawer>
);

export default RoomDrawer;
