import { useMemo } from 'react';
import {
  List, ListItem, ListItemAvatar, Avatar, ListItemText,
  IconButton, Typography, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const QueueList = ({ queue, currentUser, onRemoveSong, connectedUsers }) => {

  // This part remains unchanged
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
              <ListItem
                key={`${song.song_id}-${index}`}
                secondaryAction={
                  currentUser.id === song.added_by && (
                    <IconButton edge="end" aria-label="delete" onClick={() => onRemoveSong(song.song_id)}>
                      <DeleteIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  {index === 0 ? (
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <MusicNoteIcon />
                    </Avatar>
                  ) : (
                    <Avatar>{index + 1}</Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={song.title}
                  // --- THE FIX IS HERE ---
                  // Tell Material-UI to render the secondary container as a 'div' instead of a 'p'
                  secondaryTypographyProps={{ component: 'div' }} 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      {addedByAvatar && (
                        <Avatar
                          src={addedByAvatar}
                          sx={{ width: 20, height: 20, mr: 1 }}
                        />
                      )}
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