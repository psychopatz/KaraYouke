// src/components/QueueList.jsx
import { useMemo } from 'react';
import {
  List, ListItem, ListItemAvatar, Avatar, ListItemText,
  IconButton, Typography, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const QueueList = ({ queue, currentUser, onRemoveSong, connectedUsers }) => {

  const userMap = useMemo(() => {
    const map = new Map();
    (connectedUsers || []).forEach(user => {
      map.set(user.id, user);
    });
    return map;
  }, [connectedUsers]);

  const getAddedByDisplayData = (userId) => {
    if (userId === currentUser.id) {
      return { name: 'You', avatar: currentUser.avatarBase64 };
    }
    const user = userMap.get(userId);
    return user
      ? { name: user.name, avatar: user.avatarBase64 }
      : { name: 'A former user', avatar: null };
  };

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>
        Up Next ({queue.length})
      </Typography>
      {queue.length === 0 ? (
        <Typography color="text.secondary">The queue is empty. Add a song!</Typography>
      ) : (
        <List>
          {queue.map((song, index) => {
            const { name: addedByName, avatar: addedByAvatar } = getAddedByDisplayData(song.added_by);

            return (
              // ✅ --- THE FIX IS HERE --- ✅
              // Use `song.queue_id` instead of the old key.
              // The fallback to index is a safety net if queue_id is missing.
              <ListItem
                key={song.queue_id || `${song.song_id}-${index}`}
                secondaryAction={
                  // Note: `onRemoveSong` will now need to use the `queue_id`
                  // to identify which song to remove.
                  currentUser.id === song.added_by && (
                    <IconButton edge="end" aria-label="delete" onClick={() => onRemoveSong(song.queue_id)}>
                      <DeleteIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                   <Avatar src={addedByAvatar}>
                      <MusicNoteIcon />
                   </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={song.title}
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Added by {addedByName}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default QueueList;