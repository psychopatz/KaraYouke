// src/components/KaraokePlayer.jsx
import React from 'react';
import ReactPlayer from 'react-player';

// The wrapper style is now part of this component
const PlayerWrapper = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 1,
  backgroundColor: 'black',
};

/**
 * A reusable Karaoke Player component.
 * @param {object} props
 * @param {object} props.song - The song object to play, must have a `song_id`.
 * @param {boolean} props.isPlaying - Whether the player should be in the playing state.
 * @param {boolean} props.isLooping - Whether the video should loop.
 * @param {boolean} props.showControls - Whether to show the native player controls.
 * @param {function} props.onEnded - Callback function for when the song finishes.
 * @param {function} props.onError - Callback function for when an error occurs.
 */
const KaraokePlayer = ({ song, isPlaying, isLooping, showControls, onEnded, onError }) => {
  // If there's no song for any reason, don't render a broken player
  if (!song || !song.song_id) {
    return null;
  }

  return (
    <div style={PlayerWrapper}>
      <ReactPlayer
        // Using `src` as confirmed to be working for you
        src={`https://www.youtube.com/watch?v=${song.song_id}`}
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
              // Suggesting 720p quality
              vq: 'hd720',
            },
          },
        }}
      />
    </div>
  );
};

export default KaraokePlayer;