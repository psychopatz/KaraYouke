import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Grid } from '@mui/material';
import SearchCard from './SearchCard';
import VideoPopup from './VideoPopup';

const SearchResults = forwardRef(({ results, isFormFocused }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [videoId, setVideoId] = useState('');
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
            handleOpenVideo(results[selectedIndex].url_suffix);
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

  const handleOpenVideo = (urlSuffix) => {
    const videoId = new URLSearchParams(new URL(`https://www.youtube.com${urlSuffix}`).search).get('v');
    setVideoId(videoId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddToQueue = () => {
    // Logic to add the video to the queue
    console.log(`Add video ${videoId} to queue`);
    handleClose();
  };

  return (
    <>
      <Grid container spacing={2} tabIndex={-1} ref={ref}>
        {results.map((result, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} ref={(el) => (itemRefs.current[index] = el)}>
            <SearchCard 
              result={result} 
              selected={index === selectedIndex} 
              onClick={() => handleOpenVideo(result.url_suffix)} 
            />
          </Grid>
        ))}
      </Grid>

      <VideoPopup 
        open={open} 
        videoId={videoId} 
        onClose={handleClose} 
        onAddToQueue={handleAddToQueue} 
      />
    </>
  );
});

export default SearchResults;
