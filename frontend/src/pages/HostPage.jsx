// src/pages/HostPage.jsx

import React, { useState, useEffect } from 'react'; // NEW: Added useEffect
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import QrCode2Icon from '@mui/icons-material/QrCode2';

import { createSession } from '../api/sessionApi';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ConnectedUsersList from '../components/ConnectedUsersList';
import socket from '../socket/socket';
import useSessionSocket from '../hooks/useSessionSocket';

// NEW: Import the sessionStorage utility functions
import { setSessionItem, getSessionItem } from '../utils/sessionStorageUtils';

// NEW: Define a constant for our sessionStorage key to avoid typos
const SESSION_STORAGE_KEY = 'kara_youke_session';

const HostPageRoot = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url(/background.svg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: '1rem',
});

const ContentWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
  textAlign: 'center',
});

const HostPage = () => {
  const [sessionCode, setSessionCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);

  useSessionSocket(setConnectedUsers);

  // NEW: useEffect hook to check for an existing session on component mount
  useEffect(() => {
    const savedSession = getSessionItem(SESSION_STORAGE_KEY);

    // If we find a session in storage and the role was 'host', restore the state
    if (savedSession && savedSession.code && savedSession.role === 'host') {
      console.log('Found existing host session, restoring:', savedSession.code);
      setSessionCode(savedSession.code);

      // It's crucial to reconnect to the socket room on page load
      if (socket.disconnected) {
        socket.connect();
      }
      socket.emit('join_room', savedSession.code);
    }
  }, []); // The empty dependency array [] ensures this runs only once when the component mounts

  const handleCreateSession = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await createSession();
      if (data.session_code) {
        setSessionCode(data.session_code);

        // NEW: Save the session info to sessionStorage upon successful creation
        const sessionData = {
          code: data.session_code,
          role: 'host', // It's good practice to store the role as well
        };
        setSessionItem(SESSION_STORAGE_KEY, sessionData);

        // Join the socket room for this session
        socket.emit('join_room', data.session_code);

      } else {
        throw new Error('No session code received from server.');
      }
    } catch (err) {
      setError('Could not create session. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HostPageRoot>
      <ContentWrapper>
        {!sessionCode ? (
          <>
            <Typography variant="h3" color="white" fontWeight="bold">Ready to Host?</Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCreateSession}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <QrCode2Icon />}
              sx={{ padding: '20px 40px', fontSize: '1.5rem', borderRadius: '50px' }}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </Button>
            {error && <Typography color="error">{error}</Typography>}
          </>
        ) : (
          <>
            <QRCodeDisplay sessionCode={sessionCode} />
            <ConnectedUsersList users={connectedUsers} />
          </>
        )}
      </ContentWrapper>
    </HostPageRoot>
  );
};

export default HostPage;