// src/components/KaraokeOverlay.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

// Import our utilities and the new, self-contained NowPlayingCard
import { sanitizeTitle } from '../utils/textUtils';
import { getUserData } from '../utils/userUtils';
import NowPlayingCard from './NowPlayingCard';

// The main container that will be positioned by the page.
const TopOverlayContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  gap: theme.spacing(2),
  height: '75px',
  width: '100%',
}));

// A wrapper for the scrollable "Up Next" queue.
const ScrollableQueueWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'stretch',
  gap: theme.spacing(2),
  overflowX: 'auto',
  overflowY: 'hidden',
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


const KaraokeOverlay = ({ queue, users }) => {
  const nowPlaying = queue.length > 0 ? queue[0] : null;
  const upNext = queue.slice(1);
  const nowPlayingUser = nowPlaying ? getUserData(nowPlaying.added_by, users) : null;

  return (
    <TopOverlayContainer>
      {/* --- RENDER THE NEW SELF-CONTAINED CARD --- */}
      <NowPlayingCard song={nowPlaying} user={nowPlayingUser} />

      {/* --- RENDER THE SCROLLABLE QUEUE --- */}
      <ScrollableQueueWrapper>
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
      </ScrollableQueueWrapper>
    </TopOverlayContainer>
  );
};

export default KaraokeOverlay;