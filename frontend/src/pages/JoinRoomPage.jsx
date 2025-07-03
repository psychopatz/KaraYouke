// src/pages/JoinRoomPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MuiOtpInput } from 'mui-one-time-password-input';

// MUI Components
import { Box, Button, Typography, Modal, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LoginIcon from '@mui/icons-material/Login';

// App-specific imports
import { getLocalItem } from '../utils/localStorageUtils';
import { setSessionItem } from '../utils/sessionStorageUtils';
import { joinSession } from '../api/userApi';
import socket from '../socket/socket';
import Html5QrcodePlugin from '../components/Html5QrcodePlugin';
import ScannerWrapper from '../components/ScannerWrapper'; // Import the design wrapper

// --- STYLED COMPONENTS ---

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

// --- COMPONENT LOGIC ---

const JoinRoomPage = () => {
  const navigate = useNavigate();
  const { sessionCode: urlSessionCode } = useParams();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
  const [isScannerOpen, setScannerOpen] = useState(false);

  // Effect to pre-fill code from URL parameter
  useEffect(() => {
    if (urlSessionCode) {
      console.log(`Session code from URL: ${urlSessionCode}`);
      setCode(urlSessionCode.toUpperCase());
    }
  }, [urlSessionCode]);

  // This function is passed to the scanner plugin
  const onScanSuccess = (decodedText, decodedResult) => {
    console.log(`Scanned text: ${decodedText}`);
    setScannerOpen(false); // Close modal on successful scan

    // Split the scanned text by '/' and get the last part.
    // This works for "http://.../join-room/ABCDE" or just "/join-room/ABCDE"
    const parts = decodedText.split('/');
    const potentialCode = parts.pop() || parts.pop(); // Handles trailing slash

    if (potentialCode && potentialCode.length === 5) {
      console.log(`Extracted session code: ${potentialCode}`);
      setCode(potentialCode.toUpperCase());
    } else {
      alert("Scanned QR code does not contain a valid session link.");
    }
  };

  const onScanError = (errorMessage) => {
    // This callback can be used for debugging, but is optional.
    // console.warn(errorMessage);
  };
  
  const handleCodeChange = (newValue) => {
    setCode(newValue.toUpperCase());
  };

  const handleJoinSession = async () => {
    setIsLoading(true);
    setApiMessage({ type: '', text: '' });

    const userData = getLocalItem('kara_youke_user');
    if (!userData) {
      setApiMessage({ type: 'error', text: 'User profile not found. Redirecting...' });
      setIsLoading(false);
      navigate('/create-profile');
      return;
    }

    try {
      const response = await joinSession({
        session_code: code,
        id: userData.id,
        name: userData.name,
        avatar_base64: userData.avatar_base64,
      });

      if (response.status === 'OK') {
        setApiMessage({ type: 'success', text: response.message || 'Success! Joining room...' });
        setSessionItem('kara_youke_session', { code: code, role: 'remote', user: response.user });
        socket.emit('join_room', code);
        setTimeout(() => navigate('/remote'), 1500);
      } else {
        setApiMessage({ type: 'error', text: response.message || 'Failed to join session.' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Invalid Session Code or Server Error.';
      setApiMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <JoinRoomRoot>
      <ContentBox>
        <Typography variant="h4" component="h1" gutterBottom>
          Join a Session
        </Typography>

        {apiMessage.text && (
          <Alert severity={apiMessage.type} sx={{ mb: 2 }}>
            {apiMessage.text}
          </Alert>
        )}

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Enter the 5-digit code from the host screen.
        </Typography>

        <MuiOtpInput
          value={code}
          onChange={handleCodeChange}
          length={5}
          sx={{ gap: 1.5, mb: 2 }}
        />
        
        <Button
          variant="outlined"
          startIcon={<CameraAltIcon />}
          onClick={() => setScannerOpen(true)}
          fullWidth
          sx={{ mb: 2 }}
        >
          Scan QR Code
        </Button>

        <Button
          variant="contained"
          size="large"
          startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <LoginIcon />}
          onClick={handleJoinSession}
          disabled={code.length !== 5 || isLoading}
          fullWidth
        >
          {isLoading ? 'Joining...' : 'Join Room'}
        </Button>
      </ContentBox>

      <Modal open={isScannerOpen} onClose={() => setScannerOpen(false)}>
        <Box sx={ScannerModalStyle}>
          <Typography variant="h6" component="h2" align="center" gutterBottom>
            Scan QR Code
          </Typography>
          
          <ScannerWrapper>
            {isScannerOpen && (
              <Html5QrcodePlugin
                fps={10}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={onScanSuccess}
                qrCodeErrorCallback={onScanError}
              />
            )}
          </ScannerWrapper>

          <Button onClick={() => setScannerOpen(false)} sx={{ mt: 2 }} fullWidth>
            Cancel
          </Button>
        </Box>
      </Modal>
    </JoinRoomRoot>
  );
};

export default JoinRoomPage;