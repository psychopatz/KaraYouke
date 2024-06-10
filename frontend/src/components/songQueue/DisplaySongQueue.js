import React, { useContext } from 'react';
import { RoomContext } from './RoomContext';
import { styled } from '@mui/material/styles';
import { Box, Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import BannerComponent from '../banner/bannerComponent';
import { apiRemoveSongFromQueue } from '../../API/apiService';

const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const StyledList = styled(List)({
  display: 'flex',
  flexDirection: 'row',
  overflowX: 'auto',
  padding: 0,
  maxWidth: '100%',
  whiteSpace: 'nowrap',
});

const StyledListItem = styled(ListItem)({
  filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.9))',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  cursor: 'pointer', // Ensures the items show a pointer cursor on hover
  zIndex: 2, // Ensures the items are on top
  pointerEvents: 'auto', // Ensures the items are clickable
});

const HighlightedListItem = styled(StyledListItem)({
  backgroundColor: 'rgba(246, 132, 42, 0.4)',
  borderRadius: '0px',
});

const StyledListItemText = styled(ListItemText)({
  maxWidth: '10vw', // Adjust the max-width as needed
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textAlign: 'center',
});

const StyledListBanner = styled(ListItem)({
  filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.9))',
  backgroundColor: 'rgba(241, 103, 38, 0.9)',

});



const DisplaySongQueue = () => {
  const { roomData, loading, error } = useContext(RoomContext);

  const handleRemoveSong = async (songID) => {
    const isLastSong = false;
    try {
      if(roomData.song_queue.songID === songID) {
        isLastSong = true; 
      }
      
      await apiRemoveSongFromQueue(roomData.room_id, songID);
      // Update the roomData state to remove the song locally
      roomData.song_queue = roomData.song_queue.filter(song => song.song_id !== songID);
      if(isLastSong) {
        window.location.reload(); // Reload the website
      }
    } catch (error) {
      console.error('Error removing song from queue:', error);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <StyledBox>
      <StyledList>
        <StyledListBanner>
          <BannerComponent />
        </StyledListBanner>
        {roomData.song_queue.map((song, index) => (
          index === 0 ? (
            <HighlightedListItem key={song.song_id} onClick={() => handleRemoveSong(song.song_id)}>
              <ListItemAvatar>
                <Avatar src={song.user.profile_pic} alt={song.user.name} />
              </ListItemAvatar>
              <ListItemText 
                primary={`🎵${song.title}`} 
                secondary={`Now Playing: 🎤${song.user.name}`} 
                primaryTypographyProps={{ color: 'white' }} 
                secondaryTypographyProps={{ color: 'white' }} 
              />
            </HighlightedListItem>
          ) : (
            <StyledListItem key={song.song_id} onClick={() => handleRemoveSong(song.song_id)}>
              <ListItemAvatar>
                <Avatar src={song.user.profile_pic} alt={song.user.name} />
              </ListItemAvatar>
              <ListItemText 
                primary={song.title} 
                secondary={`Requested by: ${song.user.name}`} 
                primaryTypographyProps={{ color: 'lightgrey' }} 
                secondaryTypographyProps={{ color: 'grey' }} 
              />
            </StyledListItem>
          )
        ))}
      </StyledList>
    </StyledBox>
  );
};

export default DisplaySongQueue;
