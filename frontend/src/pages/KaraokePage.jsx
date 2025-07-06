import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Import all necessary components
import KaraokePlayer from '../components/KaraokePlayer';
import BrandingBanner from '../components/BrandingBanner';
import NowPlayingCard from '../components/NowPlayingCard';
import UpNextQueue from '../components/UpNextQueue';
import ConnectedUsersBar from '../components/ConnectedUsersBar';
import ScoreDisplay from '../components/ScoreDisplay';
import FullScreenMessage from '../components/FullScreenMessage';

// Import hooks, socket, and utilities
import socket from '../socket/socket';
import { getSessionItem } from '../utils/sessionStorageUtils';
import { getLocalItem } from '../utils/localStorageUtils';
import { getUserData } from '../utils/userUtils';
import { sanitizeTitle } from '../utils/textUtils';
import useAudio from '../hooks/useAudio';

// --- Styled Components for positioning UI elements ---
const FixedNowPlayingWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 20,
}));

const FixedBrandingWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 20,
}));

const FixedQueueWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  left: `calc(320px + ${theme.spacing(4)})`,
  right: theme.spacing(2),
  height: '75px',
  zIndex: 10,
}));

// --- Constants ---
const DEFAULT_VIDEO_ID = 'JXWElku3lCk';
const DEFAULT_SONG_OBJECT = {
  song_id: DEFAULT_VIDEO_ID,
  title: 'KaraYouke Radio - Waiting for the next song...',
  added_by: 'system',
};

const KaraokePage = () => {
  // --- State Management ---
  const [queue, setQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentSong, setCurrentSong] = useState(DEFAULT_SONG_OBJECT);
  const [finishedSinger, setFinishedSinger] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [message, setMessage] = useState(null);
  const [playerKey, setPlayerKey] = useState(Date.now());
  const [showScore, setShowScore] = useState(true); // Session-wide setting, defaults to true

  // --- Refs and Hooks ---
  const lastShownSongId = useRef(null);
  const songThatEnded = useRef(null);
  const [, playScoreSound] = useAudio('/Sounds/videokeScore.mp3');

  const session = useMemo(() => getSessionItem('kara_youke_session'), []);
  const hostUser = useMemo(() => getLocalItem('kara_youke_user'), []);
  const sessionCode = session?.code;

  // --- Handler for skipping a song without showing a score ---
  const handleSkipSong = () => {
    const songToSkip = queue[0];
    if (!songToSkip) return;
    socket.emit('remove_song', {
      session_code: sessionCode,
      queue_id: songToSkip.queue_id,
      user_id: songToSkip.added_by,
    });
  };

  // --- Effect #1: Setup Socket Event Listeners ---
  useEffect(() => {
    if (!sessionCode) return;

    // A single, unified handler for ALL session state updates
    const handleSessionUpdate = (sessionData) => {
        setQueue(sessionData.queue || []);
        setUsers(sessionData.users || []);
        if (sessionData.settings && typeof sessionData.settings.showScore === 'boolean') {
            setShowScore(sessionData.settings.showScore);
        }
    };
    
    // Handler for live, single setting changes
    const handleSettingUpdate = ({ key, value }) => {
        if (key === 'showScore') setShowScore(value);
    };

    const handlePlayerControl = (data) => {
      const { action } = data;
      switch (action) {
        case 'toggle_play_pause': setIsPlaying(prev => !prev); break;
        case 'next_song': if (queue.length > 0) handleSkipSong(); break;
      }
    };
    const handleGetPlayerState = () => socket.emit('player_state_updated', { session_code: sessionCode, isPlaying });

    socket.on('session_updated', handleSessionUpdate);
    socket.on('player_control', handlePlayerControl);
    socket.on('get_player_state', handleGetPlayerState);
    socket.on('setting_updated', handleSettingUpdate);

    return () => {
      socket.off('session_updated', handleSessionUpdate);
      socket.off('player_control', handlePlayerControl);
      socket.off('get_player_state', handleGetPlayerState);
      socket.off('setting_updated', handleSettingUpdate);
    };
  }, [sessionCode, isPlaying, queue]); // Dependencies are correct

  // --- Effect #2: Fetch Initial Data ONCE ---
  useEffect(() => {
    if (sessionCode) {
      socket.emit('get_full_session', sessionCode);
    }
  }, [sessionCode]);

  // --- Effect #3: Broadcasting Player State ---
  useEffect(() => {
    if (!sessionCode || !socket.connected) return;
    socket.emit('player_state_updated', { session_code: sessionCode, isPlaying });
  }, [isPlaying, sessionCode]);

  // --- Effect #4: Core Karaoke Logic (Current Song & Messages) ---
  useEffect(() => {
    const activeSong = queue.length > 0 ? queue[0] : DEFAULT_SONG_OBJECT;
    if (activeSong.song_id !== currentSong.song_id) { setPlayerKey(Date.now()); }
    setCurrentSong(activeSong);
    const isRealSong = activeSong.added_by !== 'system';
    const hasIntroBeenShown = activeSong.song_id === lastShownSongId.current;
    if (isRealSong && !hasIntroBeenShown) {
      const singer = getUserData(activeSong.added_by, users);
      setMessage({ type: 'intro', title: sanitizeTitle(activeSong.title), subtitle: `Sung by ${singer?.name}`, icon: '🎵', duration: 5000 });
      lastShownSongId.current = activeSong.song_id;
    } else if (!isRealSong && (!message || message.type !== 'welcome')) {
      setMessage({ type: 'welcome', duration: null });
    }
  }, [queue, users, message, currentSong]); 

  // --- Effect #5: Pause player during score screen ---
  useEffect(() => {
    setIsPlaying(!finishedSinger);
  }, [finishedSinger]);

  // --- Event Handlers ---
  const handleSongEnded = () => {
    if (currentSong?.added_by === 'system') {
      setPlayerKey(Date.now());
      return;
    }
    // Check the synchronized session-wide 'showScore' state variable.
    if (showScore) {
      songThatEnded.current = currentSong;
      const singer = getUserData(currentSong?.added_by, users);
      setFinishedSinger(singer);
    } else {
      console.log(`Skipping score because the session setting is off.`);
      socket.emit('remove_song', {
        session_code: sessionCode,
        queue_id: currentSong.queue_id,
        user_id: currentSong.added_by,
      });
    }
  };
  
  const handleMessageFinished = () => setMessage(null);
  
  const handleScoreAnimationComplete = () => {
    playScoreSound(() => {
      const songToRemove = songThatEnded.current;
      if (hostUser && sessionCode && songToRemove) {
        socket.emit('remove_song', { session_code: sessionCode, queue_id: songToRemove.queue_id, user_id: songToRemove.added_by });
      }
      setFinishedSinger(null);
      songThatEnded.current = null;
    });
  };

  const nowPlaying = queue.length > 0 ? queue[0] : null;
  const nowPlayingUser = nowPlaying ? getUserData(nowPlaying.added_by, users) : null;

  // --- Render ---
  return (
    <Box>
      <FixedNowPlayingWrapper>
        <NowPlayingCard song={nowPlaying} user={nowPlayingUser} />
      </FixedNowPlayingWrapper>
      {currentSong && currentSong.song_id !== DEFAULT_VIDEO_ID && (
        <FixedBrandingWrapper><BrandingBanner size="small" /></FixedBrandingWrapper>
      )}
      <FixedQueueWrapper><UpNextQueue queue={queue} users={users} /></FixedQueueWrapper>
      <ConnectedUsersBar users={users} />
      <KaraokePlayer
        key={playerKey} 
        song={currentSong}
        isPlaying={isPlaying}
        isLooping={currentSong.song_id === DEFAULT_VIDEO_ID}
        showControls={false}
        onEnded={handleSongEnded}
        onError={(e) => console.error('[Player Callback] onError fired:', e)}
      />
      {finishedSinger && (
        <ScoreDisplay user={finishedSinger} onCountUpFinished={handleScoreAnimationComplete} />
      )}
      <FullScreenMessage show={!!message} duration={message?.duration} onFinished={handleMessageFinished}>
        {message?.type === 'welcome' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BrandingBanner size="large" />
            <Typography variant="h5" sx={{ mt: 2, opacity: 0.8 }}>Add a song from your remote to get started!</Typography>
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