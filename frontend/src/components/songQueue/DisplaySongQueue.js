import React, { useContext } from 'react';
import { RoomContext } from './RoomContext';
import { styled } from '@mui/material/styles';
import { Box, Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import BannerComponent from '../banner/bannerComponent';

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
//   marginRight: '16px',
  filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.9))',
//   padding: '16px',
  backgroundColor: 'rgba(0, 0, 0, 0.03)',
  borderRadius: '8px',
  color: 'grey',
});

const HighlightedListItem = styled(StyledListItem)({
  filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.9))',
  backgroundColor: 'rgba(0, 0, 0, 0.09)',
  borderRadius: '0px',
//   padding: '16px',
});

const StyledListItemText = styled(ListItemText)({
  maxWidth: '10vw', // Adjust the max-width as needed
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textAlign: 'center',
});

const StyledListBanner = styled(ListItem)({
//   marginRight: '16px',
  filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.9))',
//   padding: '16px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'grey',
});

const HighlightedListItemText = styled(StyledListItemText)({
  color: 'white',
});

const DisplaySongQueue = () => {
  const { roomData, loading, error } = useContext(RoomContext);

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
            <HighlightedListItem key={song.song_id}>
              <ListItemAvatar>
                <Avatar src={song.user.profile_pic} alt={song.user.name} />
              </ListItemAvatar>
              <HighlightedListItemText 
                primary={`🎵${song.title}`} 
                secondary={`Now Playing: 🎤${song.user.name}`} 
              />
            </HighlightedListItem>
          ) : (
            <StyledListItem key={song.song_id}>
              <ListItemAvatar>
                <Avatar src={song.user.profile_pic} alt={song.user.name} />
              </ListItemAvatar>
              <StyledListItemText 
                primary={song.title} 
                secondary={`Requested by: ${song.user.name}`} 
              />
            </StyledListItem>
          )
        ))}
      </StyledList>
    </StyledBox>
  );
};

export default DisplaySongQueue;
