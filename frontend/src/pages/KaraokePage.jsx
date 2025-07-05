// src/pages/KaraokePage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Box } from '@mui/material';

import KaraokePlayer from '../components/KaraokePlayer'; // Using your reusable component
import socket from '../socket/socket';
import { getSessionItem } from '../utils/sessionStorageUtils';
import { getLocalItem } from '../utils/localStorageUtils';
import KaraokeOverlay from '../components/KaraokeOverlay';
import ScoreDisplay from '../components/ScoreDisplay';
import useAudio from '../hooks/useAudio';

const DEFAULT_VIDEO_ID = 'JXWElku3lCk';
const DEFAULT_SONG_OBJECT = {
  song_id: DEFAULT_VIDEO_ID,
  title: 'KaraYouke Radio - Waiting for the next song...',
  added_by: 'system',
};

const KaraokePage = () => {
  const session = useMemo(() => getSessionItem('kara_youke_session'), []);
  const hostUser = useMemo(() => getLocalItem('kara_youke_user'), []);
  const sessionCode = session?.code;

  const [queue, setQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentSong, setCurrentSong] = useState(DEFAULT_SONG_OBJECT);
  const [finishedSinger, setFinishedSinger] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [, playScoreSound] = useAudio('/Sounds/videokeScore.mp3');
  const songThatEnded = useRef(null);

  // Socket logic (unchanged)
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

  // Main playback logic (unchanged)
  useEffect(() => {
    const activeSong = queue.length > 0 ? queue[0] : DEFAULT_SONG_OBJECT;
    setCurrentSong(activeSong);
    const shouldBePlaying = !finishedSinger;
    if (isPlaying !== shouldBePlaying) {
      setIsPlaying(shouldBePlaying);
    }
  }, [queue, finishedSinger, isPlaying]);

  // Event handler for when a song finishes - REVISED
  const handleSongEnded = () => {
    if (currentSong?.added_by !== 'system') {
      songThatEnded.current = currentSong;
      const singer = users.find(u => u.id === currentSong?.added_by);
      setFinishedSinger(singer || { name: "A former user", avatarBase64: null });

      // --- THIS IS THE CORE OF THE FIX ---
      // We play the sound and pass it a function to execute ONLY when it's done.
      playScoreSound(() => {
        console.log("Score audio finished. Advancing to the next song.");
        
        // This is the logic that used to be in `onScoreFinished`.
        const songToRemove = songThatEnded.current;
        if (hostUser && sessionCode && songToRemove) {
          socket.emit('remove_song', {
              session_code: sessionCode,
              song_id: songToRemove.song_id,
              user_id: hostUser.id,
          });
        }
        
        // Hide the score display and allow the player to resume.
        setFinishedSinger(null); 
        songThatEnded.current = null;
      });
    }
  };

  return (
    <Box>
      <KaraokePlayer
        song={currentSong}
        isPlaying={isPlaying}
        isLooping={currentSong.song_id === DEFAULT_VIDEO_ID}
        showControls={true}
        onEnded={handleSongEnded}
        onError={(e) => console.error('[Player Callback] onError fired:', e)}
      />
      
      <KaraokeOverlay queue={queue} users={users} />

      {/* The ScoreDisplay component no longer needs an onFinished prop for this logic. */}
      {/* It's now just a simple visual component. */}
      {finishedSinger && (
        <ScoreDisplay user={finishedSinger} />
      )}
    </Box>
  );
};

export default KaraokePage;