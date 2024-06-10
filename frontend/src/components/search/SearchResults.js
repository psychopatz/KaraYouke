import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Grid } from '@mui/material';
import SearchCard from './SearchCard';
import VideoPopup from './VideoPopup';
import { apiAddSongToQueue } from '../../API/apiService';
import localStorageAPI from '../../API/localStorageAPI';

const SearchResults = forwardRef(({ results, isFormFocused, handleParentClose }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null); // Store the selected video object
  const [enterCount, setEnterCount] = useState(0); // Counter for Enter key presses
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
          if (open && selectedVideo && selectedVideo.index === selectedIndex) {
            setEnterCount((prevCount) => prevCount + 1);
            if (enterCount === 1) {
              handleAddToQueue();
              setEnterCount(0); // Reset the counter
            }
          } else {
            handleOpenVideo(results[selectedIndex]);
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
  }, [results.length, columns, isFormFocused, selectedIndex, enterCount, open, selectedVideo]);

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

  const handleOpenVideo = (video) => {
    const videoId = new URLSearchParams(new URL(`https://www.youtube.com${video.url_suffix}`).search).get('v');
    setSelectedVideo({ ...video, videoId, index: selectedIndex }); // Store the full video object and the index
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVideo(null); // Reset the selected video
  };

  const handleAddToQueue = async () => {
    if (selectedVideo) {
      try {
        const userdata = localStorageAPI.getItem('userdata');
        const roomID = userdata.session.roomID;
        const userID = userdata.session.sessionID;

        const song = {
          title: selectedVideo.title,
          url: selectedVideo.id,
          thumbnail: selectedVideo.thumbnails[0],
        };

        console.log(`Adding song to queue:`, song);

        const message = await apiAddSongToQueue(roomID, userID, song);

        console.log(`API Response to Add song to queue:`, message);
        handleParentClose();
        // Logic to handle the success, e.g., showing a success message
      } catch (error) {
        console.error('Error adding song to queue:', error);
        // Logic to handle the error, e.g., showing an error message
      }
    }
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
              onClick={() => handleOpenVideo(result)} 
            />
          </Grid>
        ))}
      </Grid>

      <VideoPopup 
        open={open} 
        videoId={selectedVideo?.videoId} 
        onClose={handleClose} 
        onAddToQueue={handleAddToQueue} 
      />
    </>
  );
});

export default SearchResults;
