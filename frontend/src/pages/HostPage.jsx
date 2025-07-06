import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Button, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';

// Import all necessary API and utility functions
import { createSession, deleteSession, validateSession } from '../api/sessionApi';
import { joinSession } from '../api/userApi';
import { setLocalItem, getLocalItem, removeLocalItem } from '../utils/localStorageUtils';
import { setSessionItem } from '../utils/sessionStorageUtils';
import useSessionSocket from '../hooks/useSessionSocket';

// Import Components and Socket
import QRCodeDisplay from '../components/QRCodeDisplay';
import ConnectedUsersList from '../components/ConnectedUsersList';
import socket from '../socket/socket';

// Use localStorage for persistence across browser sessions
const HOST_SESSION_KEY = 'kara_youke_host_session';

// --- Styled Components ---
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

const QRCodeWrapper = styled(Box)({
  position: 'relative',
  display: 'inline-block',
});

const RefreshButtonWrapper = styled(Box)({
  position: 'absolute',
  top: 0,
  right: 0,
});
// --- End Styled Components ---


const HostPage = () => {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading to check for a session
  const [error, setError] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  const hostUser = useMemo(() => getLocalItem('kara_youke_user'), []);

  // Custom hook to manage socket listeners for user updates
  useSessionSocket(setConnectedUsers);

  // A stable function to register this client as the host via WebSocket.
  // Wrapped in useCallback to prevent re-creation on every render.
  const registerAsHost = useCallback((code) => {
    if (!code) return;

    const doRegister = () => {
      console.log(`Socket connected, registering as host for ${code}`);
      socket.emit('register_host', code);
    };

    // If the socket is already connected, register immediately.
    if (socket.connected) {
      doRegister();
    } else {
      // Otherwise, wait for the 'connect' event before registering.
      // Use .once() to ensure this listener only fires once for this registration attempt.
      socket.once('connect', doRegister);
      // Ensure the socket is trying to connect if it's disconnected.
      if (socket.disconnected) {
        socket.connect();
      }
    }
  }, []);

  // This effect runs on component mount to check for and restore a previous session.
  useEffect(() => {
    const attemptRestoreSession = async () => {
      const savedSession = getLocalItem(HOST_SESSION_KEY);

      if (savedSession?.code && savedSession?.role === 'host') {
        console.log(`Found saved host session: ${savedSession.code}. Validating...`);
        const isValid = await validateSession(savedSession.code);

        if (isValid) {
          console.log("Session is valid. Reconnecting...");
          setSessionCode(savedSession.code);
          registerAsHost(savedSession.code);
        } else {
          console.log("Saved session is no longer valid on the server. Clearing.");
          removeLocalItem(HOST_SESSION_KEY);
        }
      }
      setIsLoading(false); // Finished checking, stop loading indicator
    };

    attemptRestoreSession();
  }, [registerAsHost]); // Dependency array ensures this runs once with the stable function

  const handleCreateSession = async () => {
    setIsLoading(true);
    setError('');
    if (!hostUser) {
      setError('Could not find host profile. Please create one first.');
      setIsLoading(false);
      return;
    }

    try {
      const sessionData = await createSession();
      if (sessionData.session_code) {
        const newSessionCode = sessionData.session_code;
        
        await joinSession({
          session_code: newSessionCode,
          id: hostUser.id,
          name: hostUser.name,
          avatarBase64: hostUser.avatarBase64,
        });
        
        setSessionCode(newSessionCode);
        setLocalItem(HOST_SESSION_KEY, { code: newSessionCode, role: 'host' });
        registerAsHost(newSessionCode);

      } else {
        throw new Error('No session code received from server.');
      }
    } catch (err) {
      console.error("Error creating session:", err);
      setError('Could not create session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateRoom = async () => {
    if (!sessionCode) return;

    setIsLoading(true);
    try {
      await deleteSession(sessionCode);
      // Re-running the create logic will generate a new room and update the state
      await handleCreateSession(); 
    } catch (err) {
      console.error("Failed to regenerate room", err);
      setError("Could not regenerate room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartKaraoke = () => {
    if (sessionCode) {
      // Save session info to sessionStorage for KaraokePage to use
      setSessionItem('kara_youke_session', { code: sessionCode, role: 'host' });
      navigate(`/karaoke`);
    }
  };

  const remoteUsers = connectedUsers.filter(user => user.id !== hostUser?.id);
  const hasRemotes = remoteUsers.length > 0;

  // Render a loading screen while validating the session
  if (isLoading) {
    return (
      <HostPageRoot>
        <CircularProgress color="primary" size={60} />
        <Typography sx={{ mt: 2, color: 'white' }}>Checking for active session...</Typography>
      </HostPageRoot>
    );
  }
  
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
              {'Create Room'}
            </Button>
            {error && <Typography color="error">{error}</Typography>}
          </>
        ) : (
          <>
            <QRCodeWrapper>
              <QRCodeDisplay sessionCode={sessionCode} />
              <RefreshButtonWrapper>
                <Tooltip title="Create a New Room">
                  <span> {/* Tooltip needs this span wrapper when its child might be disabled */}
                    <IconButton onClick={handleRegenerateRoom} disabled={isLoading}>
                      <RefreshIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </RefreshButtonWrapper>
            </QRCodeWrapper>

            <ConnectedUsersList users={connectedUsers} hostId={hostUser?.id} />

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStartKaraoke}
              disabled={!hasRemotes || isLoading}
              startIcon={<PlayCircleFilledWhiteIcon />}
              sx={{ padding: '15px 30px', fontSize: '1.2rem', marginTop: '1rem' }}
            >
              {hasRemotes ? 'Start KaraYouke🎤🎶' : 'Waiting for a remote...'}
            </Button>
          </>
        )}
      </ContentWrapper>
    </HostPageRoot>
  );
};

export default HostPage;