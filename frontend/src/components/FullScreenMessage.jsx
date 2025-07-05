// src/components/FullScreenMessage.jsx
import React, { useEffect } from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';

const MessageOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  pointerEvents: 'none',
});

// --- THIS IS WHERE THE DESIGN CHANGES ARE ---
const MessageContainer = styled(Paper)(({ theme }) => ({
  // 1. More transparent background
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // Was 0.75, now it's more see-through

  backdropFilter: 'blur(8px)', // Increased blur for a nicer effect
  padding: '2rem 4rem',
  textAlign: 'center',
  color: 'white',

  // 2. Add curves
  borderRadius: theme.shape.borderRadius * 2, // Was 0, now it's curved based on your theme
  
  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
}));

/**
 * A reusable component to display a temporary or permanent full-screen message.
 * (The rest of the component's logic is unchanged)
 */
const FullScreenMessage = ({ show, title, subtitle, icon, duration, onFinished, children }) => {
  useEffect(() => {
    if (show && typeof duration === 'number' && duration > 0) {
      const timer = setTimeout(() => {
        onFinished();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onFinished]);

  return (
    <Fade in={show} timeout={500}>
      <MessageOverlay>
        <MessageContainer elevation={5}>
          {children ? (
            children
          ) : (
            <>
              {icon && <Typography variant="h1" sx={{ fontSize: '4rem' }}>{icon}</Typography>}
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>{title}</Typography>
              {subtitle && <Typography variant="h5" sx={{ mt: 1, opacity: 0.8 }}>{subtitle}</Typography>}
            </>
          )}
        </MessageContainer>
      </MessageOverlay>
    </Fade>
  );
};

export default FullScreenMessage;