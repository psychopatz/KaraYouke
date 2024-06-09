import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/menu');
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h3" gutterBottom>
        Landing Page
      </Typography>
      <Typography variant="h4" gutterBottom>
        Karayouke
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleButtonClick}
        sx={{ mt: 3 }}
      >
        Go to Main Page
      </Button>
    </Box>
  );
};

export default LandingPage;
