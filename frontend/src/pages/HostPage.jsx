import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icon Imports
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import RefreshIcon from '@mui/icons-material/Refresh';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// API and Utility Imports
import { createSession, deleteSession, validateSession } from '../api/sessionApi';
import { joinSession } from '../api/userApi';
import { setLocalItem, getLocalItem, removeLocalItem } from '../utils/localStorageUtils';
import { setSessionItem } from '../utils/sessionStorageUtils';

// Component and Socket Imports
import QRCodeDisplay from '../components/QRCodeDisplay';
import ConnectedUsersList from '../components/ConnectedUsersList';
import socket from '../socket/socket';

// Constants
const HOST_SESSION_KEY = 'kara_youke_host_session';

// --- Styled Components (Unchanged) ---
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
  gap: '1.5rem',
  textAlign: 'center',
  maxWidth: '500px',
  width: '100%',
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const hostUser = useMemo(() => getLocalItem('kara_youke_user'), []);

  // --- MODIFIED: `handleStartKaraoke` now emits an event ---
  // It's defined here so it can be used in the useEffect below.
  const handleStartKaraoke = useCallback(() => {
    if (sessionCode) {
      // Announce to all remotes that the session is starting.
      socket.emit('host_started_session', { session_code: sessionCode });
      
      // Store session info and navigate.
      setSessionItem('kara_youke_session', { code: sessionCode, role: 'host' });
      navigate(`/karaoke`);
    }
  }, [navigate, sessionCode]); // Dependencies for useCallback


  // --- MODIFIED: Socket useEffect now listens for the remote start command ---
  useEffect(() => {
    if (!sessionCode) return;

    const handleSessionUpdate = (sessionData) => {
      if (sessionData && Array.isArray(sessionData.users)) {
        setConnectedUsers(sessionData.users);
      }
    };
    const handleUsersUpdate = (users) => {
      if (Array.isArray(users)) {
        setConnectedUsers(users);
      }
    };
    
    // --- NEW: This handler listens for the "start" command from any remote ---
    const handleStartFromRemote = () => {
        console.log("Received command from remote to start session.");
        // We call the memoized handleStartKaraoke function.
        handleStartKaraoke();
    };

    socket.on('session_updated', handleSessionUpdate);
    socket.on('users_updated', handleUsersUpdate);
    socket.on('start_session_from_remote', handleStartFromRemote); // <-- Attach the new listener

    if (socket.connected) {
      socket.emit('get_full_session', sessionCode);
    } else {
      socket.once('connect', () => {
        socket.emit('get_full_session', sessionCode);
      });
    }

    return () => {
      socket.off('session_updated', handleSessionUpdate);
      socket.off('users_updated', handleUsersUpdate);
      socket.off('start_session_from_remote', handleStartFromRemote); // <-- Detach the listener on cleanup
    };
  }, [sessionCode, handleStartKaraoke]); // <-- Add handleStartKaraoke as a dependency

  // registerAsHost and session restoration effect (unchanged)
  const registerAsHost = useCallback((code) => {
    if (!code) return;
    const doRegister = () => {
      console.log(`Socket connected, registering as host for ${code}`);
      socket.emit('register_host', code);
    };
    if (socket.connected) { doRegister(); } 
    else {
      socket.once('connect', doRegister);
      if (socket.disconnected) socket.connect();
    }
  }, []);

  useEffect(() => {
    const attemptRestoreSession = async () => {
      const savedSession = getLocalItem(HOST_SESSION_KEY);
      if (savedSession?.code && savedSession?.role === 'host') {
        const { valid } = await validateSession(savedSession.code);
        if (valid) {
          setSessionCode(savedSession.code);
          registerAsHost(savedSession.code);
        } else {
          removeLocalItem(HOST_SESSION_KEY);
        }
      }
      setIsLoading(false);
    };
    attemptRestoreSession();
  }, [registerAsHost]);


  // handleCreateSession (unchanged)
  const handleCreateSession = async () => {
    setIsLoading(true);
    setError('');
    if (!hostUser) {
      setError('Could not find host profile. Please create one first.');
      setIsLoading(false);
      return;
    }

    try {
      const sessionData = await createSession({ password: password || null });

      if (sessionData.session_code) {
        const newSessionCode = sessionData.session_code;
        const hostUserEntry = { id: hostUser.id, name: hostUser.name, avatarBase64: hostUser.avatarBase64 };
        
        await joinSession({
          session_code: newSessionCode,
          password: password || null,
          ...hostUserEntry
        });
        
        setSessionCode(newSessionCode);
        setLocalItem(HOST_SESSION_KEY, { code: newSessionCode, role: 'host', password: password || null });
        registerAsHost(newSessionCode);
        setConnectedUsers([hostUserEntry]);

      } else {
        throw new Error('No session code received from server.');
      }
    } catch (err) {
      console.error("Error creating session:", err);
      const errorDetail = err.response?.data?.detail || 'Please try again.';
      setError(`Could not create session. ${errorDetail}`);
    } finally {
      setIsLoading(false);
    }
  };

  // handleRegenerateRoom (unchanged)
  const handleRegenerateRoom = async () => {
    if (!sessionCode) return;
    setIsLoading(true);
    try {
      await deleteSession(sessionCode);
      await handleCreateSession(); 
    } catch (err) {
      console.error("Failed to regenerate room", err);
      setError("Could not regenerate room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const remoteUsers = connectedUsers.filter(user => user.id !== hostUser?.id);
  const hasRemotes = remoteUsers.length > 0;

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

            <TextField
              label="Optional Room Password"
              variant="filled"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ 
                maxWidth: '400px', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 1,
                '& .MuiInputBase-root': {
                    backgroundColor: 'transparent',
                },
                '& .MuiFilledInput-root:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
                '& .MuiFilledInput-root.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
              InputLabelProps={{
                style: { color: 'rgba(255, 255, 255, 0.7)' },
              }}
              InputProps={{
                style: { color: 'white' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{ color: 'white' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              variant="contained" color="primary" size="large" onClick={handleCreateSession} disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <QrCode2Icon />}
              sx={{ padding: '20px 40px', fontSize: '1.5rem', borderRadius: '50px' }}
            >
              {'Create Room'}
            </Button>
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          </>
        ) : (
          <>
            <QRCodeWrapper>
              <QRCodeDisplay sessionCode={sessionCode} />
              <RefreshButtonWrapper>
                <Tooltip title="Create a New Room">
                  <span>
                    <IconButton onClick={handleRegenerateRoom} disabled={isLoading}>
                      <RefreshIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </RefreshButtonWrapper>
            </QRCodeWrapper>

            <ConnectedUsersList users={connectedUsers} hostId={hostUser?.id} />

            <Button
              variant="contained" color="primary" size="large" 
              // The onClick handler now points to our single, reliable function
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