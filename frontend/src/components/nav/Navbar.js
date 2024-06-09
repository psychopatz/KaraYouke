import React from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import localStorageAPI from '../../API/localStorageAPI';

const Navbar = ({ title, navItems }) => {
  const navigate = useNavigate();
  const userdata = localStorageAPI.getItem('userdata');

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  return (
    <AppBar position="static" sx={{ animation: 'moveBackground 20s ease-in-out infinite' }}>
      <Toolbar>
        <Box component="img" src="/websiteBanner.png" alt="Website Banner" sx={{ height: 40 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {navItems.map((item, index) => (
          <Button key={index} color="inherit" component={Link} to={item.path}>
            {item.label}
          </Button>
        ))}
        {userdata && (
          <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
            <Avatar
              alt="Profile Picture"
              src={userdata.profilePicture}
              sx={{ cursor: 'pointer', width: 56, height: 56 }}
              onClick={handleAvatarClick}
            />
          </Box>
        )}
      </Toolbar>
      <style>
        {`
          @keyframes moveBackground {
            0% { background-position: 0 0; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0 0; }
          }
          .MuiAppBar-root {
            background-image: url('/background.svg');
            background-size: cover;
            background-repeat: repeat;
          }
        `}
      </style>
    </AppBar>
  );
};

export default Navbar;
