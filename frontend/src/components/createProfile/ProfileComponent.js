import React, { useEffect, useState } from 'react';
import { Grid, TextField, Button, Card, CardContent, Typography, Avatar } from '@mui/material';
import localStorageAPI from '../../API/localStorageAPI';
import { useNavigate } from 'react-router-dom';

const builtInAvatars = [
  '/Avatars/1.svg',
  '/Avatars/2.svg',
  '/Avatars/3.svg',
  '/Avatars/4.svg',
  '/Avatars/5.svg',
  '/Avatars/6.svg',
  '/Avatars/7.svg',
  '/Avatars/8.svg',
  '/Avatars/9.svg',
  '/Avatars/10.svg',
  '/Avatars/11.svg',
  '/Avatars/12.svg',
  '/Avatars/13.svg',
  '/Avatars/14.svg',
  '/Avatars/15.svg',
  '/Avatars/16.svg',
  '/Avatars/17.svg',
  '/Avatars/18.svg',
  '/Avatars/19.svg',
  '/Avatars/20.svg',
  '/Avatars/21.svg',
];

const ProfileComponent = () => {
  const userdata = localStorageAPI.getItem('userdata');
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(builtInAvatars[0]);
  const [message, setMessage] = useState('');

  const handleAvatarClick = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleSubmit = () => {
    const newUser = {
      name,
      profilePicture: selectedAvatar,
      session:{roomID: "",sessionID: "",type:""}
    };
    localStorageAPI.setItem('userdata', newUser);

    navigate('/menu');
  };

  useEffect(() => {
    if (!userdata) {
      setMessage('What can I call you?');
      
    }else{
      setMessage(`Edit ${userdata.name}'s Profile`);
      setName(userdata.name);
      setSelectedAvatar(userdata.profilePicture);
    }
  }, [navigate]);

  return (
    <Card sx={{ maxWidth: 500, margin: 'auto', mt: 5, p: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {message}
        </Typography>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Avatar
            alt="Current Profile Picture"
            src={selectedAvatar}
            sx={{ width: 100, height: 100, margin: 'auto' }}
          />
          <Typography variant="subtitle1">Current Profile Picture</Typography>
        </div>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={name}
          inputProps={{ maxLength: 8 }}
          onChange={(e) => setName(e.target.value)}
        />
        <Typography variant="subtitle1" gutterBottom>
          Choose Profile Picture
        </Typography>
        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 20 }}>
          <Grid container spacing={2}>
            {builtInAvatars.map((avatar, index) => (
              <Grid item xs={4} key={index}>
                <Avatar
                  alt={`Avatar ${index + 1}`}
                  src={avatar}
                  sx={{
                    width: 60,
                    height: 60,
                    margin: 'auto',
                    border: selectedAvatar === avatar ? '2px solid black' : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleAvatarClick(avatar)}
                />
              </Grid>
            ))}
          </Grid>
        </div>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileComponent;
