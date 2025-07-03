import React, { useState, useEffect, useMemo } from 'react';
import { Container, Box, Typography } from '@mui/material';

import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import QueueList from '../components/QueueList';
import socket from '../socket/socket';
import { getSessionItem } from '../utils/sessionStorageUtils';
import { searchYoutube } from '../api/youtubeApi';

// REMOVED: No longer importing from queueApi
// import { addSongToQueue, removeSongFromQueue } from '../api/queueApi';

const PAGINATION_STEP = 5;
const MAX_RESULTS = 20;

const RemotePage = () => {
  const [queue, setQueue] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(PAGINATION_STEP);
  const [hasMore, setHasMore] = useState(true);

  const session = useMemo(() => getSessionItem('kara_youke_session'), []);
  const currentUser = useMemo(() => session?.user, [session]);
  
  useEffect(() => {
    if (!session?.code) return;
    
    // Setup listeners for real-time updates from the server
    const handleQueueUpdate = (newQueue) => setQueue(newQueue);
    const handleUsersUpdate = (newUsers) => setConnectedUsers(newUsers);
    
    socket.on('queue_updated', handleQueueUpdate);
    socket.on('users_updated', handleUsersUpdate);

    // Request initial state when the component loads
    socket.emit('get_session_info', session.code);

    // Cleanup listeners when the component unmounts
    return () => {
      socket.off('queue_updated', handleQueueUpdate);
      socket.off('users_updated', handleUsersUpdate);
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

  // --- UPDATED: This now emits a socket event ---
  const handleAddSong = (song) => {
    const newSongEntry = {
      song_id: song.id,
      title: song.title,
      duration: song.duration,
      added_by: currentUser.id,
      thumbnails: song.thumbnails,
    };
    
    // Emit the event directly to the server's socket handler
    socket.emit('add_song', {
      session_code: session.code,
      song: newSongEntry,
    });

    // Clear the UI locally for instant feedback
    setSearchResults([]);
    setSearchQuery('');
  };

  // --- UPDATED: This also emits a socket event ---
  const handleRemoveSong = (songId) => {
    // Emit the event directly to the server's socket handler
    socket.emit('remove_song', {
      session_code: session.code,
      song_id: songId,
      user_id: currentUser.id,
    });
  };
  
  if (!currentUser) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1">
        Hello, {currentUser.name}!
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        Session: {session.code}
      </Typography>

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
    </Container>
  );
};

export default RemotePage;