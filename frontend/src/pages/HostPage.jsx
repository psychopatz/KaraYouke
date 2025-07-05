import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';

// Import all necessary API and utility functions
import { createSession, deleteSession } from '../api/sessionApi';
import { joinSession } from '../api/userApi';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ConnectedUsersList from '../components/ConnectedUsersList';
import socket from '../socket/socket';
import useSessionSocket from '../hooks/useSessionSocket';
import { setSessionItem, getSessionItem } from '../utils/sessionStorageUtils';
import { getLocalItem } from '../utils/localStorageUtils';

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

const QRCodeWrapper = styled(Box)({
  position: 'relative',
  display: 'inline-block',
});

const RefreshButtonWrapper = styled(Box)({
  position: 'absolute',
  top: 0,
  right: 0,
});

const HostPage = () => {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  const hostUser = useMemo(() => getLocalItem('kara_youke_user'), []);

  useSessionSocket(setConnectedUsers);

  useEffect(() => {
    const savedSession = getSessionItem(SESSION_STORAGE_KEY);
    if (savedSession && savedSession.code && savedSession.role === 'host') {
      setSessionCode(savedSession.code);
      if (socket.disconnected) {
        socket.connect();
      }
      socket.emit('join_room', savedSession.code);
    }
  }, []);

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
        setSessionItem(SESSION_STORAGE_KEY, { code: newSessionCode, role: 'host' });
        socket.emit('join_room', newSessionCode);
      } else {
        throw new Error('No session code received from server.');
      }
    } catch (err) {
      console.log(err)
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
      navigate(`/karaoke`);
    }
  };

  const remoteUsers = connectedUsers.filter(user => user.id !== hostUser?.id);
  const hasRemotes = remoteUsers.length > 0;

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

            <ConnectedUsersList users={connectedUsers} />

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStartKaraoke}
              disabled={!hasRemotes || isLoading}
              startIcon={<PlayCircleFilledWhiteIcon />}
              sx={{
                padding: '15px 30px',
                fontSize: '1.2rem',
                marginTop: '1rem',
              }}
            >
              {isLoading ? 'Regenerating...' : hasRemotes ? 'Start KaraYouke🎤🎶' : 'Waiting for a remote...'}
            </Button>
          </>
        )}
      </ContentWrapper>
    </HostPageRoot>
  );
};

export default HostPage;