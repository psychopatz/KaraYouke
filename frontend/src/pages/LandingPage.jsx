// src/pages/LandingPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

// The root component uses your SVG as a full-screen background. (No changes here)
const LandingPageRoot = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url(/background.svg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  padding: theme.spacing(2),
}));

// The "glassmorphism" box for our content. (No changes here)
const ContentBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4), // Adjusted padding slightly for smaller screens
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(6), // Keep original padding for larger screens
    },
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    color: '#fff',
}));


const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartSession = () => {
    navigate('/host');
  };

  const handleJoinSession = () => {
    navigate('/remote');
  };

  return (
    <LandingPageRoot>
      <Container maxWidth="md">
        <ContentBox>
          {/* 1. Added the website banner image */}
          {/* We use a Box with component="img" for easy styling with the `sx` prop. */}
          <Box
            component="img"
            src="/websiteBanner.png" // The image from your public folder
            alt="KaraYouke Banner"
            sx={{
              maxWidth: '350px', // Control the max size of the banner
              width: '100%',     // Make it responsive
              height: 'auto',    // Maintain aspect ratio
              mb: 2,             // Add some margin at the bottom
            }}
          />

          {/* 2. Updated the main text to "KaraYouke🎤🎶" */}
          <Typography 
            variant="h2" // Adjusted variant for better hierarchy with the banner
            component="h1" 
            gutterBottom
            sx={{ 
                fontWeight: '700',
                fontSize: { xs: '2.5rem', sm: '3.5rem' }, // Adjusted font size
                textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
            }}
          >
            KaraYouke🎤🎶
          </Typography>

          <Typography 
            variant="h5" 
            component="p"
            sx={{ 
                color: 'grey.300', 
                marginBottom: 4,
                fontWeight: '400',
                fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Your personal karaoke party, anywhere, anytime.
          </Typography>

          {/* Call-to-action buttons (No changes here) */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<MicIcon />}
              onClick={handleStartSession}
              sx={{ py: 2, px: 4 }}
            >
              Start a Session (Host)
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<PhoneIphoneIcon />}
              onClick={handleJoinSession}
              sx={{ py: 2, px: 4, borderColor: 'secondary.light', '&:hover': { borderColor: 'secondary.main' } }}
            >
              Join a Session (Remote)
            </Button>
          </Stack>
        </ContentBox>
      </Container>
    </LandingPageRoot>
  );
};

export default LandingPage;