import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import localStorageAPI from '../../API/localStorageAPI';

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  width: '80%',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const StyledButton = styled(Box)(({ theme }) => ({
  border: '2px solid yellow',
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    marginBottom: 0,
  },
}));

const ImagePlaceholder = styled(Box)(({ theme }) => ({
  border: '2px solid red',
  height: '300px',
  width: '300px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 'auto',
  [theme.breakpoints.down('sm')]: {
    height: '200px',
    width: '200px',
  },
}));

const MainMenuComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userdata = localStorageAPI.getItem('userdata');
    if (!userdata) {
      navigate('/profile');
    }
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    
    // Enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [navigate]);

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    navigate('/join-room');
  };

  return (
    <Container>
      <ButtonContainer>
        <StyledButton onClick={handleCreateRoom}>
          <Typography variant="h5">Create New Room</Typography>
          <ImagePlaceholder>
            <Typography variant="body1" color="red">Image Placeholder</Typography>
          </ImagePlaceholder>
        </StyledButton>
        <StyledButton onClick={handleJoinRoom}>
          <Typography variant="h5">Join Room</Typography>
          <ImagePlaceholder>
            <Typography variant="body1" color="red">Image Placeholder</Typography>
          </ImagePlaceholder>
        </StyledButton>
      </ButtonContainer>
    </Container>
  );
}

export default MainMenuComponent;
