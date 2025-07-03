// src/layout/RemoteRouteGuard.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { getSessionItem, removeSessionItem } from '../utils/sessionStorageUtils';
import { CircularProgress, Box, Typography } from '@mui/material';
import axiosClient from '../api/axiosClient';

const RemoteRouteGuard = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = getSessionItem('kara_youke_session');

      // 1. Check for session data and correct role
      if (!session || session.role !== 'remote' || !session.code) {
        console.log("No remote session found, redirecting.");
        navigate('/');
        return;
      }

      // 2. Check if the session is still active on the backend
      try {
        await axiosClient.get(`/session/${session.code}`);
        // If the request succeeds, the session is active.
        setIsVerified(true);
      } catch (error) {
        // If it fails (e.g., 404), the session is dead.
        console.error("Session is no longer active, redirecting.", error);
        removeSessionItem('kara_youke_session'); // Clean up dead session
        navigate('/');
      }
    };

    checkSession();
  }, [navigate]);

  if (!isVerified) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Verifying Session...</Typography>
      </Box>
    );
  }

  // If verified, render the child route (our RemotePage)
  return <Outlet />;
};

export default RemoteRouteGuard;