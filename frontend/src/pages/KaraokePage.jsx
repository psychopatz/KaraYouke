// src/pages/KaraokePage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Import all independent UI components
import KaraokePlayer from '../components/KaraokePlayer';
import BrandingBanner from '../components/BrandingBanner';
import NowPlayingCard from '../components/NowPlayingCard';
import UpNextQueue from '../components/UpNextQueue';
import ConnectedUsersBar from '../components/ConnectedUsersBar';
import ScoreDisplay from '../components/ScoreDisplay';

// Import hooks and utilities
import socket from '../socket/socket';
import { getSessionItem } from '../utils/sessionStorageUtils';
import { getLocalItem } from '../utils/localStorageUtils';
import { getUserData } from '../utils/userUtils';
import useAudio from '../hooks/useAudio';

// --- STYLED WRAPPERS FOR POSITIONING EACH COMPONENT ---

// Wrapper to position the Now Playing Card at the top-left.
const FixedNowPlayingWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 20,
}));

// Wrapper to position the Branding Banner at the bottom-left.
const FixedBrandingWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 20,
}));

// Wrapper for the scrollable queue, positioned to the right of the Now Playing card.
const FixedQueueWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  left: `calc(320px + ${theme.spacing(4)})`,
  right: theme.spacing(2),
  height: '75px',
  zIndex: 10,
}));

// Define the default video as a "song object" for consistent logic
const DEFAULT_VIDEO_ID = 'JXWElku3lCk';
const DEFAULT_SONG_OBJECT = {
  song_id: DEFAULT_VIDEO_ID,
  title: 'KaraYouke Radio - Waiting for the next song...',
  added_by: 'system',
};

const KaraokePage = () => {
  // --- STATE MANAGEMENT ---
  const [queue, setQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentSong, setCurrentSong] = useState(DEFAULT_SONG_OBJECT);
  const [finishedSinger, setFinishedSinger] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [, playScoreSound] = useAudio('/Sounds/videokeScore.mp3');
  const songThatEnded = useRef(null);
  
  const session = useMemo(() => getSessionItem('kara_youke_session'), []);
  const hostUser = useMemo(() => getLocalItem('kara_youke_user'), []);
  const sessionCode = session?.code;

  // --- EFFECT HOOKS ---
  useEffect(() => {
    if (!sessionCode) return;
    const handleQueueUpdate = (newQueue) => setQueue(newQueue);
    const handleUsersUpdate = (newUsers) => setUsers(newUsers);
    
    socket.on('queue_updated', handleQueueUpdate);
    socket.on('users_updated', handleUsersUpdate);
    
    socket.emit('get_session_info', sessionCode);
    
    return () => {
      socket.off('queue_updated', handleQueueUpdate);
      socket.off('users_updated', handleUsersUpdate);
    };
  }, [sessionCode]);

  useEffect(() => {
    const activeSong = queue.length > 0 ? queue[0] : DEFAULT_SONG_OBJECT;
    setCurrentSong(activeSong);
    const shouldBePlaying = !finishedSinger;
    if (isPlaying !== shouldBePlaying) {
      setIsPlaying(shouldBePlaying);
    }
  }, [queue, finishedSinger, isPlaying]);

  // --- EVENT HANDLERS ---
  const handleSongEnded = () => {
    if (currentSong?.added_by === 'system') return;

    songThatEnded.current = currentSong;
    const singer = getUserData(currentSong?.added_by, users);
    setFinishedSinger(singer);

    playScoreSound(() => {
      const songToRemove = songThatEnded.current;
      if (hostUser && sessionCode && songToRemove) {
        socket.emit('remove_song', {
            session_code: sessionCode,
            song_id: songToRemove.song_id,
            user_id: hostUser.id,
        });
      }
      setFinishedSinger(null);
      songThatEnded.current = null;
    });
  };

  const nowPlaying = queue.length > 0 ? queue[0] : null;
  const nowPlayingUser = nowPlaying ? getUserData(nowPlaying.added_by, users) : null;
  
  // --- RENDER ---
  return (
    <Box>
      <FixedNowPlayingWrapper>
        <NowPlayingCard song={nowPlaying} user={nowPlayingUser} />
      </FixedNowPlayingWrapper>
      
      <FixedBrandingWrapper>
        <BrandingBanner />
      </FixedBrandingWrapper>
      
      <FixedQueueWrapper>
        <UpNextQueue queue={queue} users={users} />
      </FixedQueueWrapper>

      <ConnectedUsersBar users={users} />

      <KaraokePlayer
        song={currentSong}
        isPlaying={isPlaying}
        isLooping={currentSong.song_id === DEFAULT_VIDEO_ID}
        showControls={true}
        onEnded={handleSongEnded}
        onError={(e) => console.error('[Player Callback] onError fired:', e)}
      />
      
      {finishedSinger && <ScoreDisplay user={finishedSinger} />}
    </Box>
  );
};

export default KaraokePage;