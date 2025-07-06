import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Stack, FormControlLabel, Switch } from '@mui/material';
import { styled } from '@mui/material/styles';

// Import Components
import KaraokeControls from '../components/KaraokeControls';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import QueueList from '../components/QueueList';

// Import Socket, Utils, and API functions
import socket from '../socket/socket';
import { getSessionItem } from '../utils/sessionStorageUtils';
import { setLocalItem, getLocalItem } from '../utils/localStorageUtils';
import { searchYoutube } from '../api/youtubeApi';

// --- Constants & Styled Components ---
const PAGINATION_STEP = 5;
const MAX_RESULTS = 20;

const RemotePageRoot = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  backgroundImage: 'url(/background.svg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const ContentContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  width: '100%',
  maxWidth: theme.breakpoints.values.md,
  maxHeight: 'calc(100vh - 32px)',
  overflowY: 'auto',
  '&::-webkit-scrollbar': { width: '8px' },
  '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.2)' },
  '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: '4px' }
}));


const RemotePage = () => {
  // --- State Management ---
  const [queue, setQueue] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(PAGINATION_STEP);
  const [hasMore, setHasMore] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [clientId, setClientId] = useState('');
  const [showScore, setShowScore] = useState(() => getLocalItem('kara_youke_showScore', true));

  // --- Memoized Values ---
  const session = useMemo(() => getSessionItem('kara_youke_session'), []);
  const currentUser = useMemo(() => session?.user, [session]);

  // --- Derived State: Logic for disabling controls ---
  // The Play/Pause button is disabled if no real song is playing.
  const isPlayPauseDisabled = queue.length === 0;
  // The "Next" button is disabled if there isn't a song *after* the current one.
  const isNextDisabled = queue.length <= 1;
  
  // --- Main Effect for Socket Communication ---
  useEffect(() => {
    if (!session?.code) return;
    
    const updateClientId = () => setClientId(socket.id || '');
    const handleQueueUpdate = (newQueue) => setQueue(newQueue);
    const handleUsersUpdate = (newUsers) => setConnectedUsers(newUsers);
    const handlePlayerStateUpdate = ({ isPlaying: newIsPlaying }) => setIsPlaying(newIsPlaying);
    
    socket.on('connect', updateClientId);
    socket.on('queue_updated', handleQueueUpdate);
    socket.on('users_updated', handleUsersUpdate);
    socket.on('player_state_updated', handlePlayerStateUpdate);

    updateClientId();
    socket.emit('get_session_info', session.code);
    socket.emit('get_player_state', session.code);

    return () => {
      socket.off('connect', updateClientId);
      socket.off('queue_updated', handleQueueUpdate);
      socket.off('users_updated', handleUsersUpdate);
      socket.off('player_state_updated', handlePlayerStateUpdate);
    };
  }, [session]);

  // --- Handlers ---
  const fetchResults = useCallback(async (query, currentLimit) => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const data = await searchYoutube(query, currentLimit);
      const formattedResults = data.results.map(item => ({ id: item.id, title: item.title, duration: item.duration, thumbnails: item.thumbnails }));
      setSearchResults(formattedResults);
      setHasMore(formattedResults.length < MAX_RESULTS && formattedResults.length > 0);
    } catch (error) { console.error("Failed to fetch search results", error); setSearchResults([]); } finally { setIsLoading(false); }
  }, []);

  const handleSearch = useCallback(() => { setLimit(PAGINATION_STEP); setSearchResults([]); fetchResults(searchQuery, PAGINATION_STEP); }, [searchQuery, fetchResults]);
  const handleLoadMore = useCallback(() => { const newLimit = Math.min(limit + PAGINATION_STEP, MAX_RESULTS); setLimit(newLimit); fetchResults(searchQuery, newLimit); }, [limit, searchQuery, fetchResults]);
  const handleAddSong = useCallback((song) => {
    const newSongEntry = { song_id: song.id, title: song.title, duration: song.duration, added_by: currentUser.id, thumbnails: song.thumbnails, show_score: showScore };
    socket.emit('add_song', { session_code: session.code, song: newSongEntry });
    setSearchResults([]); setSearchQuery('');
  }, [currentUser, session, showScore]);
  const handleRemoveSong = useCallback((queueId) => { socket.emit('remove_song', { session_code: session.code, queue_id: queueId, user_id: currentUser.id }); }, [currentUser, session]);
  const handleTogglePlayPause = () => { socket.emit('player_control', { session_code: session.code, action: 'toggle_play_pause', user: { id: currentUser.id, name: currentUser.name }}); };
  const handleNextSong = () => { socket.emit('player_control', { session_code: session.code, action: 'next_song', user: { id: currentUser.id, name: currentUser.name }}); };
  const handleShowScoreChange = (event) => { const newShowScoreValue = event.target.checked; setShowScore(newShowScoreValue); setLocalItem('kara_youke_showScore', newShowScoreValue); };
  
  if (!currentUser) return null;

  // --- Render ---
  return (
    <>
      <RemotePageRoot>
        <ContentContainer>
          <Stack spacing={2} sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h1">Welcome, {currentUser.name}!</Typography>
            <Typography color="text.secondary" gutterBottom>Session Code: <strong>{session.code}</strong></Typography>
          </Stack>
          
          <KaraokeControls
            isPlaying={isPlaying}
            onPlayPause={handleTogglePlayPause}
            onNext={handleNextSong}
            isPlayPauseDisabled={isPlayPauseDisabled}
            isNextDisabled={isNextDisabled}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={showScore} onChange={handleShowScoreChange} color="primary" />}
              label="Show My Score"
            />
          </Box>

          <Box mt={2}>
            <SearchBar query={searchQuery} onQueryChange={setSearchQuery} onSearch={handleSearch} isLoading={isLoading} />
            <SearchResults results={searchResults} onAddSong={handleAddSong} isLoading={isLoading} loadMore={handleLoadMore} hasMore={hasMore} />
          </Box>

          <QueueList queue={queue} currentUser={currentUser} onRemoveSong={handleRemoveSong} connectedUsers={connectedUsers} />
        </ContentContainer>
      </RemotePageRoot>
      
      {clientId && (
        <Box sx={{ position: 'fixed', bottom: 8, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'rgba(255, 255, 255, 0.5)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace', zIndex: 100 }}>
          Client ID: {clientId}
        </Box>
      )}
    </>
  );
};

export default RemotePage;