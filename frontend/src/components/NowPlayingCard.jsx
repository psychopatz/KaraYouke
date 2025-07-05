// src/components/NowPlayingCard.jsx
import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { sanitizeTitle } from '../utils/textUtils';

// The animation scrolls the container from its start (0%) to the halfway point (-50%).
// Because the content is duplicated, this creates a perfect, seamless loop.
const scrollAnimation = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const CardContainer = styled(Box)({
  position: 'relative',
  width: '320px',
  height: '75px',
  flexShrink: 0,
});

const ContentBox = styled(Paper)({
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: 0,
  padding: '8px 12px 8px 45px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100%',
  overflow: 'hidden',
});

const DanglingAvatar = styled(Avatar)(({ theme }) => ({
  position: 'absolute',
  width: 50,
  height: 50,
  border: `3px solid ${theme.palette.primary.main}`,
  bottom: -15,
  left: -15,
  zIndex: 2,
}));

// This container acts as a "window" for the scrolling text.
const MarqueeContainer = styled(Box)({
  width: '100%',
  display: 'flex',
  overflow: 'hidden',
});

// --- THE ANIMATION FIX ---
// The animation styles are now applied DIRECTLY to the Typography component.
// This is a much more stable and direct approach.
const ScrollingTypography = styled(Typography)(({ duration }) => ({
  flexShrink: 0, // Prevent the text from shrinking
  whiteSpace: 'nowrap', // Keep all the text on a single line
  minWidth: '200%', // Makes space for the duplicated text, creating the loop
  willChange: 'transform', // A performance hint for the browser
  animation: `${scrollAnimation} ${duration}s linear infinite`,
}));

const AddedByText = styled(Typography)({
  fontStyle: 'italic',
  color: '#aaa',
  textAlign: 'left',
  marginTop: 'auto',
});

const NowPlayingCard = ({ song, user }) => {
  if (!song || !user) {
    return (
      <CardContainer>
        <ContentBox elevation={1}>
          <Typography variant="body1" color="text.secondary">
            Add new songs using the remote
          </Typography>
        </ContentBox>
      </CardContainer>
    );
  }

  const cleanTitle = sanitizeTitle(song.title);
  // Create the duplicated string for the seamless effect.
  const duplicatedTitle = `🎵 ${cleanTitle} \u00A0\u00A0\u00A0|\u00A0\u00A0\u00A0 🎵 ${cleanTitle}`;
  // Adjust animation speed based on text length for a more natural feel.
  const animationDuration = Math.max(12, cleanTitle.length / 2);

  return (
    <CardContainer>
      <DanglingAvatar src={user.avatarBase64} alt={user.name} />
      <ContentBox elevation={3}>
        <MarqueeContainer>
          <ScrollingTypography duration={animationDuration} variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            {duplicatedTitle}
          </ScrollingTypography>
        </MarqueeContainer>
        <AddedByText variant="body2">
          Added by: {user.name}
        </AddedByText>
      </ContentBox>
    </CardContainer>
  );
};

export default NowPlayingCard;