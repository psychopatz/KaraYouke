// src/pages/KaraokePage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Import all independent UI components
import KaraokePlayer from '../components/KaraokePlayer';
import BrandingBanner from '../components/BrandingBanner';
import NowPlayingCard from '../components/NowPlayingCard';
import UpNextQueue from '../components/UpNextQueue';
import ConnectedUsersBar from '../components/ConnectedUsersBar';
import ScoreDisplay from '../components/ScoreDisplay';
import FullScreenMessage from '../components/FullScreenMessage';

// Import hooks and utilities
import socket from '../socket/socket';
import { getSessionItem } from '../utils/sessionStorageUtils';
import { getLocalItem } from '../utils/localStorageUtils';
import { getUserData } from '../utils/userUtils';
import { sanitizeTitle } from '../utils/textUtils';
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
  const [isPlaying, setIsPlaying] = useState(false); // Start paused
  const [message, setMessage] = useState(null);
  const lastShownSongId = useRef(null);
  const [, playScoreSound] = useAudio('/Sounds/videokeScore.mp3');
  const songThatEnded = useRef(null);

  const session = useMemo(() => getSessionItem('kara_youke_session'), []);
  const hostUser = useMemo(() => getLocalItem('kara_youke_user'), []);
  const sessionCode = session?.code;

  // --- EFFECT HOOKS ---

  // Effect #1: Handles Socket Logic
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

  // Effect #2: Manages the current song and which message to display.
  useEffect(() => {
    const activeSong = queue.length > 0 ? queue[0] : DEFAULT_SONG_OBJECT;
    setCurrentSong(activeSong);

    const isRealSong = activeSong.added_by !== 'system';
    const hasIntroBeenShown = activeSong.song_id === lastShownSongId.current;

    if (isRealSong && !hasIntroBeenShown) {
      const singer = getUserData(activeSong.added_by, users);
      setMessage({
        type: 'intro',
        title: sanitizeTitle(activeSong.title),
        subtitle: `Sung by ${singer.name}`,
        icon: '🎵',
        duration: 5000, // Timed message
      });
      lastShownSongId.current = activeSong.song_id;
    } else if (!isRealSong && (!message || message.type !== 'welcome')) {
      // Show permanent welcome message if queue is empty
      setMessage({ type: 'welcome', duration: null });
    }
  }, [queue, users, message]);

  // Effect #3: Controls ONLY the playing state. This is simple and reliable.
  useEffect(() => {
    // The player should be playing if there are NO active overlays (message or score).
    setIsPlaying(!message && !finishedSinger);
  }, [message, finishedSinger]);


  // --- EVENT HANDLERS ---
  const handleSongEnded = () => {
    if (currentSong?.added_by === 'system') return;

    songThatEnded.current = currentSong;
    const singer = getUserData(currentSong?.added_by, users);
    setFinishedSinger(singer);

    playScoreSound(() => {
      const songToRemove = songThatEnded.current;
      if (hostUser && sessionCode && songToRemove) {
        socket.emit('remove_song', { session_code: sessionCode, song_id: songToRemove.song_id, user_id: hostUser.id });
      }
      setFinishedSinger(null);
      songThatEnded.current = null;
    });
  };

  const handleMessageFinished = () => {
    setMessage(null); // This is called by timed messages to hide themselves.
  };

  const nowPlaying = queue.length > 0 ? queue[0] : null;
  const nowPlayingUser = nowPlaying ? getUserData(nowPlaying.added_by, users) : null;

  // --- RENDER ---
  return (
    <Box>
      <FixedNowPlayingWrapper>
        <NowPlayingCard song={nowPlaying} user={nowPlayingUser} />
      </FixedNowPlayingWrapper>

      {/* --- THIS IS THE FIX --- */}
      {/* Only show the small banner at the bottom-left if a real song is playing */}
      {currentSong && currentSong.song_id !== DEFAULT_VIDEO_ID && (
        <FixedBrandingWrapper>
          <BrandingBanner size="small" />
        </FixedBrandingWrapper>
      )}

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

      <FullScreenMessage
        show={!!message}
        duration={message?.duration}
        onFinished={handleMessageFinished}
      >
        {message?.type === 'welcome' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BrandingBanner size="large" />
            <Typography variant="h5" sx={{ mt: 2, opacity: 0.8 }}>
              Add a song from your remote to get started!
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h1" sx={{ fontSize: '4rem' }}>{message?.icon}</Typography>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>{message?.title}</Typography>
            <Typography variant="h5" sx={{ mt: 1, opacity: 0.8 }}>{message?.subtitle}</Typography>
          </>
        )}
      </FullScreenMessage>
    </Box>
  );
};

export default KaraokePage;