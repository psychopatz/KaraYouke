// src/components/UpNextQueue.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { sanitizeTitle } from '../utils/textUtils';
import { getUserData } from '../utils/userUtils';

// A wrapper for the scrollable "Up Next" queue.
const ScrollableQueueWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'stretch',
  gap: theme.spacing(1),
  overflowX: 'auto',
  overflowY: 'hidden',
  height: '100%', // Ensure it fills the parent's height
  '&::-webkit-scrollbar': { height: '6px' },
  '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.2)' },
  '&::-webkit-scrollbar-thumb': { background: theme.palette.primary.dark, borderRadius: '3px' },
}));

// Styling for the items in the "Up Next" queue
const UpNextItem = styled(Paper)({
  flexShrink: 0,
  padding: '8px 12px',
  borderRadius: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  width: '280px',
  overflow: 'hidden',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  border: '2px solid transparent',
});


const UpNextQueue = ({ queue, users }) => {
  const upNext = queue.slice(1); // Get all songs except the one currently playing

  return (
    <ScrollableQueueWrapper>
      {upNext.map((song, index) => {
        const songUser = getUserData(song.added_by, users);
        return (
          // ✅ --- THE FIX IS HERE --- ✅
          // Use `song.queue_id` for a truly unique key.
          <UpNextItem key={song.queue_id || song.song_id} elevation={1}>
            <Typography noWrap>
              {index + 1}. {sanitizeTitle(song.title)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Added by {songUser.name}
            </Typography>
          </UpNextItem>
        );
      })}
    </ScrollableQueueWrapper>
  );
};

export default UpNextQueue;