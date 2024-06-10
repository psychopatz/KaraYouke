import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme, selected }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: selected ? 'black' : theme.palette.background.paper,
  color: selected ? 'white' : 'inherit',
  transition: 'background-color 0.3s ease-in-out',
  textDecoration: 'none',
}));

const SearchCard = ({ result, selected, onClick }) => (
  <StyledCard selected={selected} onClick={onClick}>
    <CardMedia
      component="img"
      height="140"
      image={result.thumbnails[0]}
      alt={result.title}
    />
    <CardContent>
      <Typography variant="h6" component="div" style={{ color: selected ? 'white' : 'inherit' }}>
        {result.title}
      </Typography>
      <Typography variant="body2" color={selected ? 'white' : 'text.secondary'}>
        <strong>Channel:</strong> {result.channel}
      </Typography>
      <Typography variant="body2" color={selected ? 'white' : 'text.secondary'}>
        <strong>Duration:</strong> {result.duration}
      </Typography>
      <Typography variant="body2" color={selected ? 'white' : 'text.secondary'}>
        <strong>Views:</strong> {result.views}
      </Typography>
      <Typography variant="body2" color={selected ? 'white' : 'text.secondary'}>
        <strong>Published:</strong> {result.publish_time}
      </Typography>
    </CardContent>
  </StyledCard>
);

export default SearchCard;
