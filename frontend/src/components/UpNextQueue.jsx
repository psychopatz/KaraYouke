// src/components/UpNextQueue.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

import { sanitizeTitle } from '../utils/textUtils';
import { getUserData } from '../utils/userUtils';

// The container for ONLY the "Up Next" queue. It handles the horizontal scrolling.
const ScrollableWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch',
  gap: theme.spacing(2),
  width: '100%',
  height: '100%',
  overflowX: 'auto',
  overflowY: 'hidden',
  paddingBottom: '10px', // Provides space for the scrollbar so it's not cramped
  '&::-webkit-scrollbar': { height: '6px' },
  '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.2)' },
  '&::-webkit-scrollbar-thumb': { background: theme.palette.primary.dark, borderRadius: '3px' },
}));

// Styling for each item in the "Up Next" queue.
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
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  border: '2px solid transparent',
});

/**
 * A component that renders only the horizontally scrollable "Up Next" queue.
 * @param {object} props
 * @param {Array<object>} props.queue - The full song queue.
 * @param {Array<object>} props.users - The list of all users.
 */
const UpNextQueue = ({ queue, users }) => {
  // We only care about the songs *after* the one currently playing.
  const upNext = queue.slice(1);

  return (
    <ScrollableWrapper>
      {upNext.map((song, index) => {
        const songUser = getUserData(song.added_by, users);
        return (
          <UpNextItem key={song.song_id} elevation={1}>
            <Typography noWrap>
              {index + 1}. {sanitizeTitle(song.title)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Added by {songUser.name}
            </Typography>
          </UpNextItem>
        );
      })}
    </ScrollableWrapper>
  );
};

export default UpNextQueue;