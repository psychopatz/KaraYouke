// src/components/KaraokeOverlay.jsx
import React from 'react';
import { Box, List, ListItem, ListItemText, Avatar, AvatarGroup, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';

const OverlayRoot = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '2rem',
  pointerEvents: 'none',
  color: 'white',
  textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
  // --- THE FIX IS HERE ---
  // Explicitly set a higher z-index to ensure this overlay
  // always renders on top of the video player.
  zIndex: 10,
});

const QueueContainer = styled(Box)({
  alignSelf: 'flex-start',
  backgroundColor: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(5px)',
  borderRadius: '8px',
  padding: '1rem',
  maxWidth: '35%',
  minWidth: '300px',
});

const UsersContainer = styled(Box)({
  alignSelf: 'center',
  backgroundColor: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(5px)',
  borderRadius: '50px',
  padding: '0.5rem 1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

const HeaderBox = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    marginBottom: '0.5rem',
});

const KaraokeOverlay = ({ queue, users }) => {
  const nowPlaying = queue && queue.length > 0 ? queue[0] : null;
  const upNext = queue ? queue.slice(1, 6) : [];

  return (
    <OverlayRoot>
      <QueueContainer>
        {nowPlaying ? (
          <>
            <HeaderBox>
              <MusicNoteIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6">Now Playing</Typography>
            </HeaderBox>
            <Typography variant="body1" noWrap sx={{ pl: 4, mb: 2, fontWeight: 'bold' }}>
              {nowPlaying.title}
            </Typography>
          </>
        ) : (
            <HeaderBox>
                <QueueMusicIcon />
                <Typography variant="h6">Queue is empty</Typography>
            </HeaderBox>
        )}

        {upNext.length > 0 && (
          <>
            <HeaderBox>
              <QueueMusicIcon />
              <Typography variant="h6">Up Next</Typography>
            </HeaderBox>
            <List dense sx={{ pt: 0, pl: 4 }}>
              {upNext.map((song) => (
                <ListItem key={song.song_id} disablePadding>
                  <ListItemText primary={song.title} primaryTypographyProps={{ noWrap: true, variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </QueueContainer>
      
      <UsersContainer>
        <Typography>Remotes Active:</Typography>
        <AvatarGroup max={8}>
          {users.map(user => (
            <Avatar key={user.id} alt={user.name} src={user.avatarBase64} />
          ))}
        </AvatarGroup>
      </UsersContainer>
    </OverlayRoot>
  );
};

export default KaraokeOverlay;