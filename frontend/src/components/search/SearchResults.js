import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { styled } from '@mui/system';

const SearchCard = styled(Card)(({ theme, selected }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: selected ? 'black' : theme.palette.background.paper,
  color: selected ? 'white' : 'inherit',
  transition: 'background-color 0.3s ease-in-out',
}));

const SearchResults = forwardRef(({ results, isFormFocused }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const columns = 3; // Adjust this based on your layout
  const itemRefs = useRef([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isFormFocused) return; // Do nothing if the form is focused

      switch (event.key) {
        case 'ArrowUp':
          setSelectedIndex((prevIndex) => Math.max(prevIndex - columns, 0));
          break;
        case 'ArrowDown':
          setSelectedIndex((prevIndex) => Math.min(prevIndex + columns, results.length - 1));
          break;
        case 'ArrowLeft':
          setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case 'ArrowRight':
          setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, results.length - 1));
          break;
        case 'Enter':
          if (itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex].querySelector('a').click();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [results.length, columns, isFormFocused, selectedIndex]);

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [ref, results]);

  return (
    <Grid container spacing={2} tabIndex={-1} ref={ref}>
      {results.map((result, index) => (
        <Grid item xs={12} sm={6} md={4} key={index} ref={(el) => (itemRefs.current[index] = el)}>
          <SearchCard selected={index === selectedIndex}>
            <CardMedia
              component="img"
              height="140"
              image={result.thumbnails[0]}
              alt={result.title}
            />
            <CardContent>
              <Typography variant="h6" component="div">
                <a href={`https://www.youtube.com${result.url_suffix}`} target="_blank" rel="noopener noreferrer" style={{ color: index === selectedIndex ? 'white' : 'inherit' }}>
                  {result.title}
                </a>
              </Typography>
              <Typography variant="body2" color={index === selectedIndex ? 'white' : 'text.secondary'}>
                <strong>Channel:</strong> {result.channel}
              </Typography>
              <Typography variant="body2" color={index === selectedIndex ? 'white' : 'text.secondary'}>
                <strong>Duration:</strong> {result.duration}
              </Typography>
              <Typography variant="body2" color={index === selectedIndex ? 'white' : 'text.secondary'}>
                <strong>Views:</strong> {result.views}
              </Typography>
              <Typography variant="body2" color={index === selectedIndex ? 'white' : 'text.secondary'}>
                <strong>Published:</strong> {result.publish_time}
              </Typography>
            </CardContent>
          </SearchCard>
        </Grid>
      ))}
    </Grid>
  );
});

export default SearchResults;
