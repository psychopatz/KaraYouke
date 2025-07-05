// src/pages/ProfileCreationPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Container, Paper, TextField, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { setLocalItem } from '../utils/localStorageUtils';
import AvatarSelector from '../components/AvatarSelector';

// --- STYLED COMPONENTS ---

const ProfilePageRoot = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url(/background.svg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: '1rem',
});

const ProfileContentBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  maxWidth: '500px',
  width: '100%',
}));

const UserInfoBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  marginBottom: '16px',
});

// --- COMPONENT LOGIC ---

const ProfileCreationPage = () => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(''); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSave = () => {
    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters long.');
      return;
    }
    setError('');

    // Create the user data object as requested
    const userData = {
      id: uuidv4(),
      name: name.trim(),
      avatarBase64: selectedAvatar, // Saving the path here as discussed
    };

    // Save to localStorage using our utility
    setLocalItem('kara_youke_user', userData);

    // Navigate back to the landing page
    navigate('/');
  };

  return (
    <ProfilePageRoot>
      <Container maxWidth="sm">
        <ProfileContentBox>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create Your Profile
          </Typography>
          <UserInfoBox>
            <TextField
              label="Username"
              variant="filled"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              error={!!error}
              helperText={error}
              InputLabelProps={{ style: { color: '#ccc' } }}
              sx={{
                '& .MuiFilledInput-root': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            />
            <Avatar
              src={selectedAvatar}
              sx={{ width: 80, height: 80, border: '2px solid white' }}
            />
          </UserInfoBox>

          <AvatarSelector
            selectedAvatar={selectedAvatar}
            onAvatarChange={setSelectedAvatar}
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={handleSave}
            startIcon={<CheckCircleIcon />}
            sx={{ marginTop: 3, py: 1.5, fontSize: '1.1rem' }}
          >
            Save Profile
          </Button>
        </ProfileContentBox>
      </Container>
    </ProfilePageRoot>
  );
};

export default ProfileCreationPage;