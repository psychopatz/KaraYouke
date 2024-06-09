import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, styled } from '@mui/material';
import getRandomScore from './getRandomScore';

const ScoreContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

const BouncingAvatar = styled(Avatar)(({ theme }) => ({
  width: '40vh',
  height: '40vh',
  animation: 'bounce 2s infinite',
  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': {
      transform: 'translateY(0)',
    },
    '40%': {
      transform: 'translateY(-30px)',
    },
    '60%': {
      transform: 'translateY(-15px)',
    },
  },
}));

const ScoreGenerator = ({ user = { name: 'Test', profilePicture: '/Avatars/3.svg' } }) => {
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [message, setMessage] = useState('Please do not Sing!');
  const [scoreColor, setScoreColor] = useState('black');

  useEffect(() => {
    const generatedScore = getRandomScore();
    setScore(generatedScore);
  }, []);

  useEffect(() => {
    if (displayScore < score) {
      const incrementScore = () => {
        setDisplayScore((prev) => (prev < score ? prev + 1 : prev));
      };
      const intervalId = setInterval(incrementScore, 20); // Adjust the interval as needed
      return () => clearInterval(intervalId);
    }
  }, [displayScore, score]);

  useEffect(() => {
    if (score <= 10) {
      setMessage('🤬Please Dont Sing!');
      setScoreColor('red');
    } else if(score <= 20){
      setMessage("🥱You're a Bad Singer!");
      setScoreColor('orange');
    } else if (score <= 30) {
      setMessage('🤔An Okay Singer! I guess...');
      setScoreColor('darkyellow');
    } else if (score <= 40) {
      setMessage('😅Keep practicing');
      setScoreColor('yellow');
    } else if (score <= 50) {
      setMessage('🙄An Okay Singer! 👍');
      setScoreColor('green');
    } else if (score <= 79) {
      setMessage('🫠Good job!');
      setScoreColor('lightgreen');
    } else if (score <= 99) {
      setMessage('😏Great performance!');
      setScoreColor('purple');
    } else {
      setMessage('😱Outstanding! You are the Winner 🏆');
      setScoreColor('gold');
    }
  }, [score]);

  return (
    <ScoreContainer>
      <BouncingAvatar src={user.profilePicture} alt={user.name} />
      <Typography sx={{ fontSize: '5vh' }}>{user.name} Score!</Typography>
      <Typography sx={{ fontSize: '10vh', color: scoreColor }}>{displayScore} Points</Typography>
      <Typography sx={{ fontSize: '5vh' }}>{message}</Typography>
    </ScoreContainer>
  );
};

export default ScoreGenerator;
