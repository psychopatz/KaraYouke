// src/components/SearchResults.jsx
import React, { useRef, useCallback, useEffect } from 'react';
import {
  List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, Box,
  CircularProgress, Typography, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';

const ResultsContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(5px)',
  maxHeight: '40vh', // Limit height
  overflowY: 'auto', // Make it scrollable
}));

const SearchResults = ({ results, onAddSong, isLoading, loadMore, hasMore }) => {
  const observer = useRef();

  // This callback will be attached to the last element in the list
  const lastResultElementRef = useCallback(node => {
    if (isLoading) return; // Don't trigger while loading
    if (observer.current) observer.current.disconnect(); // Disconnect old observer

    observer.current = new IntersectionObserver(entries => {
      // If the last element is visible and we have more results to load
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node); // Observe the new last element
  }, [isLoading, hasMore, loadMore]);


  if (results.length === 0 && !isLoading) {
    return null; // Don't show anything if there are no results
  }

  return (
    <ResultsContainer>
      <List>
        {results.map((song, index) => {
          // Check if this is the last element to attach the ref
          const isLastElement = results.length === index + 1;
          return (
            <ListItem
              key={song.id}
              ref={isLastElement ? lastResultElementRef : null}
              secondaryAction={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => onAddSong(song)}
                >
                  Add
                </Button>
              }
            >
              <ListItemAvatar>
                {/* Use the first thumbnail available */}
                <Avatar variant="square" src={song.thumbnails[0]} sx={{ width: 60, height: 45, mr: 2 }} />
              </ListItemAvatar>
              <ListItemText
                primary={song.title}
                secondary={song.duration}
              />
            </ListItem>
          );
        })}
      </List>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {!hasMore && results.length > 0 && (
         <Typography align="center" color="text.secondary" sx={{ p: 2 }}>
            No more results
         </Typography>
      )}
    </ResultsContainer>
  );
};

export default SearchResults;