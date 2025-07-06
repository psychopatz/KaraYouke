import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

// NEW: Import the new controls component
import KaraokeControls from '../components/KaraokeControls';

// Existing Imports
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import QueueList from '../components/QueueList';
import socket from '../socket/socket';
import { getSessionItem } from '../utils/sessionStorageUtils';
import { searchYoutube } from '../api/youtubeApi';

const PAGINATION_STEP = 5;
const MAX_RESULTS = 20;

// NEW: Styled components for the design overhaul, inspired by LandingPage
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
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
  },
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  width: '100%',
  maxWidth: theme.breakpoints.values.md, // equivalent to Container maxWidth="md"
  maxHeight: 'calc(100vh - 32px)', // Full height minus padding
  overflowY: 'auto',
  // Custom scrollbar for better aesthetics
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  }
}));

const RemotePage = () => {
  const [queue, setQueue] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(PAGINATION_STEP);
  const [hasMore, setHasMore] = useState(true);
  
  // NEW: State for player controls, default to true. Will be updated by the host.
  const [isPlaying, setIsPlaying] = useState(true);

  const session = useMemo(() => getSessionItem('kara_youke_session'), []);
  const currentUser = useMemo(() => session?.user, [session]);
  
  useEffect(() => {
    if (!session?.code) return;
    
    // NEW: Handler for player state updates from the host
    const handlePlayerStateUpdate = ({ isPlaying: newIsPlaying }) => {
      setIsPlaying(newIsPlaying);
    };
    const handleQueueUpdate = (newQueue) => setQueue(newQueue);
    const handleUsersUpdate = (newUsers) => setConnectedUsers(newUsers);
    
    socket.on('queue_updated', handleQueueUpdate);
    socket.on('users_updated', handleUsersUpdate);
    // NEW: Listen for player state changes
    socket.on('player_state_updated', handlePlayerStateUpdate);

    // Request initial data from the session
    socket.emit('get_session_info', session.code);
    // NEW: Request initial player state when component mounts
    socket.emit('get_player_state', session.code);

    return () => {
      socket.off('queue_updated', handleQueueUpdate);
      socket.off('users_updated', handleUsersUpdate);
      // NEW: Clean up the listener
      socket.off('player_state_updated', handlePlayerStateUpdate);
    };
  }, [session]);

  const fetchResults = async (query, currentLimit) => {
    setIsLoading(true);
    try {
      const data = await searchYoutube(query, currentLimit);
      if (data.status === 'OK') {
        setSearchResults(data.results);
        setHasMore(data.results.length < MAX_RESULTS);
      }
    } catch (error) {
      console.error("Failed to fetch search results", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setLimit(PAGINATION_STEP);
    setSearchResults([]);
    fetchResults(searchQuery, PAGINATION_STEP);
  };

  const handleLoadMore = () => {
    const newLimit = Math.min(limit + PAGINATION_STEP, MAX_RESULTS);
    setLimit(newLimit);
    fetchResults(searchQuery, newLimit);
  };

  const handleAddSong = (song) => {
    const newSongEntry = {
      song_id: song.id,
      title: song.title,
      duration: song.duration,
      added_by: currentUser.id,
      thumbnails: song.thumbnails,
    };
    
    socket.emit('add_song', {
      session_code: session.code,
      song: newSongEntry,
    });

    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveSong = (queueId) => {
    socket.emit('remove_song', {
      session_code: session.code,
      queue_id: queueId,
      user_id: currentUser.id,
    });
  };
  
  // --- NEW: Handlers for Karaoke Controls ---
  const handleTogglePlayPause = () => {
    // This event will be sent to the backend, which then relays it to the host
    socket.emit('player_control', {
      session_code: session.code,
      action: 'toggle_play_pause',
    });
  };

  const handleNextSong = () => {
    socket.emit('player_control', {
      session_code: session.code,
      action: 'next_song',
    });
  };
  
  if (!currentUser) return null;

  return (
    // NEW: Apply the new root style
    <RemotePageRoot>
      {/* NEW: Use the new content container style */}
      <ContentContainer>
        <Stack spacing={2} sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h1">
                Welcome, {currentUser.name}!
            </Typography>
            <Typography color="text.secondary" gutterBottom>
                Session Code: <strong>{session.code}</strong>
            </Typography>
        </Stack>

        {/* NEW: Add the KaraokeControls component */}
        <KaraokeControls
          isPlaying={isPlaying}
          onPlayPause={handleTogglePlayPause}
          onNext={handleNextSong}
        />

        <Box mt={4}>
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
          <SearchResults
            results={searchResults}
            onAddSong={handleAddSong}
            isLoading={isLoading}
            loadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </Box>

        <QueueList
          queue={queue}
          currentUser={currentUser}
          onRemoveSong={handleRemoveSong}
          connectedUsers={connectedUsers}
        />
      </ContentContainer>
    </RemotePageRoot>
  );
};

export default RemotePage;