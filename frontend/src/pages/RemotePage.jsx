import React, { useState, useEffect, useMemo } from 'react';
import { Container, Box, Typography } from '@mui/material';

import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import QueueList from '../components/QueueList';
import socket from '../socket/socket';
import { getSessionItem } from '../utils/sessionStorageUtils';
import { searchYoutube } from '../api/youtubeApi';
import { addSongToQueue, removeSongFromQueue } from '../api/queueApi';

const PAGINATION_STEP = 5;
const MAX_RESULTS = 20;

const RemotePage = () => {
  const [queue, setQueue] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // This state now controls the SearchBar
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(PAGINATION_STEP);
  const [hasMore, setHasMore] = useState(true);

  const session = useMemo(() => getSessionItem('kara_youke_session'), []);
  const currentUser = useMemo(() => session?.user, [session]);
  
  useEffect(() => {
    if (!session?.code) return;
    const handleQueueUpdate = (newQueue) => setQueue(newQueue);
    const handleUsersUpdate = (newUsers) => setConnectedUsers(newUsers);
    socket.on('queue_updated', handleQueueUpdate);
    socket.on('users_updated', handleUsersUpdate);
    socket.emit('get_session_info', session.code);
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

  const handleAddSong = async (song) => {
    const newSongEntry = {
      song_id: song.id,
      title: song.title,
      duration: song.duration,
      added_by: currentUser.id,
      thumbnails: song.thumbnails,
    };
    try {
      const response = await addSongToQueue(session.code, newSongEntry);
      if (response.status === 'OK' && response.queue) {
        setQueue(response.queue);
        // After successfully adding, clear results and the search input
        setSearchResults([]);
        setSearchQuery(''); // This line clears the search bar
      }
    } catch (error) {
      console.error("Failed to add song:", error);
      alert('Error: Could not add song to the queue.');
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const response = await removeSongFromQueue(session.code, songId, currentUser.id);
      if (response.status === 'OK' && response.queue) {
        setQueue(response.queue);
      }
    } catch (error) {
      console.error("Failed to remove song:", error);
      alert('Error: Could not remove song.');
    }
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