// src/components/ScoreDisplay.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, styled } from '@mui/material';
import getRandomScore from '../utils/getRandomScore';

const ScoreRoot = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  zIndex: 100,
  color: 'white',
});

const BouncingAvatar = styled(Avatar)({ /* ... Same as your reference ... */ });

const ScoreDisplay = ({ user, onFinished }) => {
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [message, setMessage] = useState('');
  const [scoreColor, setScoreColor] = useState('white');

  // Generate the score once when the component mounts
  useEffect(() => {
    setScore(getRandomScore());
  }, []);

  // Animate the score counting up
  useEffect(() => {
    if (score > 0 && displayScore < score) {
      const interval = setTimeout(() => {
        setDisplayScore(prev => Math.min(prev + 1, score));
      }, 30); // Adjust speed of count-up
      return () => clearTimeout(interval);
    }
  }, [displayScore, score]);

  // Set message and color when the final score is known
  useEffect(() => {
    if (score > 0) {
      if (score <= 10) { setMessage('👍For hire: Vocal coach.'); setScoreColor('#ff4d4d'); }
      else if (score <= 40) { setMessage('😅Keep practicing'); setScoreColor('#ffa726'); }
      else if (score <= 79) { setMessage('🫠Good job!'); setScoreColor('#66bb6a'); }
      else if (score <= 99) { setMessage('😏Mindblowing!'); setScoreColor('#ab47bc'); }
      else { setMessage('😱Perfect Score! 🏆'); setScoreColor('#ffd700'); }
    }
  }, [score]);

  // When the count-up is finished, wait a few seconds then call onFinished
  useEffect(() => {
    if (score > 0 && displayScore === score) {
      const timer = setTimeout(() => {
        onFinished();
      }, 5000); // Display score for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [displayScore, score, onFinished]);

  return (
    <ScoreRoot>
      <BouncingAvatar src={user.avatarBase64} alt={user.name} />
      <Typography sx={{ fontSize: '5vh', fontWeight: 'bold' }}>{user.name}'s Score!</Typography>
      <Typography sx={{ fontSize: '10vh', fontWeight: 'bold', color: scoreColor }}>{displayScore}</Typography>
      <Typography sx={{ fontSize: '5vh' }}>{message}</Typography>
    </ScoreRoot>
  );
};

export default ScoreDisplay;