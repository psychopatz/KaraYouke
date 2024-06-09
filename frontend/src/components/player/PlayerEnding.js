import React, { useEffect, useRef } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ScoreGenerator from './ScoreGenerator';

const FullPageContainer = styled(Box)({
  position: 'relative',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const ContentContainer = styled(Box)({
  position: 'relative',
  zIndex: 1,
  color: '#fff',
  textAlign: 'center',
});

const PlayerEnding = () => {
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.play().catch(error => console.error('Error playing audio:', error));

      const handleAudioEnd = () => {
        navigate('/play');
      };

      audio.addEventListener('ended', handleAudioEnd);

      return () => {
        audio.removeEventListener('ended', handleAudioEnd);
      };
    }
  }, [navigate]);

  return (
    <FullPageContainer>
      <ContentContainer>
        <audio ref={audioRef} src="/Sounds/videokeScore.mp3" />
        <ScoreGenerator />
      </ContentContainer>
    </FullPageContainer>
  );
};

export default PlayerEnding;
