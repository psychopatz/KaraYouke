import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { styled } from '@mui/system';

const SearchCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SearchResults = ({ results }) => (
  <Grid container spacing={2}>
    {results.map((result, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <SearchCard>
          <CardMedia
            component="img"
            height="140"
            image={result.thumbnails[0]}
            alt={result.title}
          />
          <CardContent>
            <Typography variant="h6" component="div">
              <a href={`https://www.youtube.com${result.url_suffix}`} target="_blank" rel="noopener noreferrer">
                {result.title}
              </a>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Channel:</strong> {result.channel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Duration:</strong> {result.duration}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Views:</strong> {result.views}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Published:</strong> {result.publish_time}
            </Typography>
          </CardContent>
        </SearchCard>
      </Grid>
    ))}
  </Grid>
);

export default SearchResults;
