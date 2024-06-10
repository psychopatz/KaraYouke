import React, { useContext, useEffect, useRef } from 'react';
import { Box, Typography, styled } from '@mui/material';
import ScoreGenerator from './ScoreGenerator';
import { RoomContext } from '../songQueue/RoomContext';

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
  const { roomData, roomID, deleteFirstSongFromQueue, setVideoEnded, setCurrentPlaying, handleIdlePlayer } = useContext(RoomContext);
  const user = { name: roomData.users[0].name, profilePicture: roomData.users[0].profile_pic }

  useEffect(() => {
    const audio = audioRef.current;

    const playAudio = () => {
      audio.play().catch(error => console.error('Error playing audio:', error));
    };

    const handleCanPlayThrough = () => {
      playAudio();
    };

    const handleAudioEnd = () => {
      deleteFirstSongFromQueue();
      setVideoEnded(false);
      if (roomData.song_queue.length === 0) {
        handleIdlePlayer();
      } else {
        setCurrentPlaying("CkHUhUop1HM");
        setCurrentPlaying(roomData.song_queue[0].song_id);
      }
      
    };

    if (audio) {
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('ended', handleAudioEnd);

      // Play audio when component mounts
      playAudio();

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('ended', handleAudioEnd);
      };
    }
  }, [roomData, roomID, deleteFirstSongFromQueue, setVideoEnded, setCurrentPlaying, handleIdlePlayer]);

  return (
    <FullPageContainer>
      <ContentContainer>
        <audio ref={audioRef} src="/Sounds/videokeScore.mp3" />
        <ScoreGenerator user = { user} />
      </ContentContainer>
    </FullPageContainer>
  );
};

export default PlayerEnding;
