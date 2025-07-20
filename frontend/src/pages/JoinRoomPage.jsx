import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MuiOtpInput } from 'mui-one-time-password-input';

// MUI Component Imports
import { Box, Button, Typography, Modal, CircularProgress, Alert, TextField, InputAdornment, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

// Icon Imports
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LoginIcon from '@mui/icons-material/Login';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// App-specific Imports
import { getLocalItem } from '../utils/localStorageUtils';
import { setSessionItem } from '../utils/sessionStorageUtils';
import { validateSession } from '../api/sessionApi';
import { joinSession } from '../api/userApi';
import socket from '../socket/socket';
import Html5QrcodePlugin from '../components/Html5QrcodePlugin';
import ScannerWrapper from '../components/ScannerWrapper';

// --- STYLED COMPONENTS (Unchanged) ---
const JoinRoomRoot = styled(Box)({
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

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  maxWidth: '450px',
  width: '100%',
  textAlign: 'center',
}));

const ScannerModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};
// --- END STYLED COMPONENTS ---

const JoinRoomPage = () => {
  const navigate = useNavigate();
  const { sessionCode: urlSessionCode } = useParams();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
  const [isScannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (urlSessionCode) {
      setCode(urlSessionCode.toUpperCase());
    }
  }, [urlSessionCode]);

  useEffect(() => {
    if (code.length < 5) {
      setIsCodeValid(false);
      setIsPasswordRequired(false);
      setApiMessage({ type: '', text: '' });
      return;
    }
    
    const validateCode = async () => {
      setIsValidating(true);
      setIsPasswordRequired(false);
      setApiMessage({ type: '', text: '' });

      try {
        const response = await validateSession(code);
        if (response.valid) {
          setIsCodeValid(true);
          setIsPasswordRequired(response.password_required);
          if (!response.password_required) {
            setApiMessage({ type: 'success', text: 'Valid code. Ready to join!' });
          }
        } else {
          setIsCodeValid(false);
          setApiMessage({ type: 'error', text: 'This session code does not exist.' });
        }
      } catch (error) {
        setIsCodeValid(false);
        setApiMessage({ type: 'error', text: 'Could not validate session. Server may be down.' });
      } finally {
        setIsValidating(false);
      }
    };

    validateCode();
  }, [code]);


  const onScanSuccess = (decodedText) => {
    setScannerOpen(false);

    // To make the code agnostic to the domain, we find the last non-empty segment of the URL path.
    // This correctly extracts 'E4M7D' from '.../join-room/E4M7D' or '.../join-room/E4M7D/'
    const lastSegment = decodedText.split('/').filter(segment => segment).pop();

    // We assume the last segment is the session code.
    // Let's validate it's in the expected 5-character alphanumeric format.
    if (lastSegment && /^[a-zA-Z0-9]{5}$/.test(lastSegment)) {
      setCode(lastSegment.toUpperCase());
    } else {
      setApiMessage({
        type: 'error',
        text: 'Invalid QR Code. Could not find a valid session code.'
      });
    }
  };

  const handleCodeChange = (newValue) => {
    setCode(newValue.toUpperCase());
    setPassword('');
  };

  const handleJoinSession = async () => {
    setIsLoading(true);
    setApiMessage({ type: '', text: '' });

    const userData = getLocalItem('kara_youke_user');
    if (!userData) {
      navigate('/create-profile');
      return;
    }

    try {
      const response = await joinSession({
        session_code: code,
        password: password,
        id: userData.id,
        name: userData.name,
        avatarBase64: userData.avatarBase64,
      });

      if (response.status === 'OK') {
        setApiMessage({ type: 'success', text: 'Success! Joining room...' });
        setSessionItem('kara_youke_session', { code: code, role: 'remote', user: response.user });
        socket.emit('join_room', code);
        setTimeout(() => navigate('/remote'), 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'An unexpected error occurred.';
      setApiMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const isJoinButtonDisabled =
    !isCodeValid ||
    isLoading ||
    isValidating ||
    (isPasswordRequired && !password);

  return (
    <JoinRoomRoot>
      <ContentBox>
        <Typography variant="h4" component="h1" gutterBottom>Join a Session</Typography>
        {apiMessage.text && <Alert severity={apiMessage.type} sx={{ mb: 2 }}>{apiMessage.text}</Alert>}
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Enter the 5-digit code from the host screen.
        </Typography>

        <MuiOtpInput value={code} onChange={handleCodeChange} length={5} sx={{ gap: 1.5, mb: 1 }} />

        {isValidating && <CircularProgress size={20} sx={{ my: 1 }} />}

        {isPasswordRequired && (
          <TextField
            label="Room Password"
            variant="filled"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ my: 2, /* styles copied from HostPage */ }}
            InputLabelProps={{ style: { color: 'rgba(255, 255, 255, 0.7)' } }}
            InputProps={{
              style: { color: 'white' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'white' }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
        
        <Button variant="outlined" startIcon={<CameraAltIcon />} onClick={() => setScannerOpen(true)} fullWidth sx={{ mb: 2 }}>
          Scan QR Code
        </Button>

        <Button
          variant="contained" size="large"
          startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <LoginIcon />}
          onClick={handleJoinSession}
          disabled={isJoinButtonDisabled}
          fullWidth
        >
          {isLoading ? 'Joining...' : 'Join Room'}
        </Button>
      </ContentBox>

      <Modal open={isScannerOpen} onClose={() => setScannerOpen(false)}>
        <Box sx={ScannerModalStyle}>
          <Typography variant="h6" component="h2" align="center" gutterBottom>Scan QR Code</Typography>
          <ScannerWrapper>
            {isScannerOpen && (
              <Html5QrcodePlugin fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={onScanSuccess} />
            )}
          </ScannerWrapper>
          <Button onClick={() => setScannerOpen(false)} sx={{ mt: 2 }} fullWidth>Cancel</Button>
        </Box>
      </Modal>
    </JoinRoomRoot>
  );
};

export default JoinRoomPage;