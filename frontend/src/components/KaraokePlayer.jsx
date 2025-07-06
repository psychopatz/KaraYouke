// src/components/KaraokePlayer.jsx
import React from 'react';
import ReactPlayer from 'react-player'; 

const PlayerWrapper = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: -1, // Changed to -1 to be behind all content by default
  backgroundColor: 'black',
  // Added a vignette effect to make foreground text more readable
  '::after': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    pointerEvents: 'none',
  },
};

const KaraokePlayer = ({ song, isPlaying, isLooping, showControls, onEnded, onError }) => {
  if (!song || !song.song_id) {
    return null;
  }

  return (
    <div style={PlayerWrapper}>
      <ReactPlayer
        // Note: 'url' is the more standard prop name, but 'src' works too.
        src={`https://www.youtube.com/watch?v=${song.song_id}&vq=hd720`}
        // --- THIS IS THE FIX ---
        // It now correctly uses the isPlaying prop from the parent component.
        playing={isPlaying}
        loop={isLooping}
        controls={showControls}
        onEnded={onEnded}
        onError={onError}
        width="100%"
        height="100%"
        config={{
          youtube: {
            playerVars: {
              autoplay: 1,
              iv_load_policy: 3,
              modestbranding: 1,
              vq: 'hd720',
            },
          },
        }}
      />
    </div>
  );
};

export default KaraokePlayer;