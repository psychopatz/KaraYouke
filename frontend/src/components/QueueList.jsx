// src/components/QueueList.jsx
import React from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const QueueList = ({ queue, currentUser, onRemoveSong }) => {
  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>
        Up Next ({queue.length})
      </Typography>
      {queue.length === 0 ? (
        <Typography color="text.secondary">The queue is empty. Add a song!</Typography>
      ) : (
        <List>
          {queue.map((song, index) => (
            <ListItem
              key={`${song.song_id}-${index}`}
              secondaryAction={
                // Only show delete button if the user added the song
                currentUser.id === song.added_by && (
                  <IconButton edge="end" aria-label="delete" onClick={() => onRemoveSong(song.song_id)}>
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                {index === 0 ? <Avatar sx={{bgcolor: 'primary.main'}}><MusicNoteIcon /></Avatar> : <Avatar>{index + 1}</Avatar>}
              </ListItemAvatar>
              <ListItemText
                primary={song.title}
                secondary={`Added by ${song.added_by === currentUser.id ? 'You' : 'Someone Else'}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default QueueList;