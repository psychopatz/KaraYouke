import React, { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import YouTube from 'react-youtube';

const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

const VideoPopup = ({ open, videoId, onClose, onAddToQueue }) => {
  const playerRef = useRef(null);
  const isMobile = isMobileDevice();

  const onPlayerReady = (event) => {
    const player = event.target;
    playerRef.current = player;
    const duration = player.getDuration();
    const targetTime = duration * 0.5;
    player.seekTo(targetTime, true); // Move to 50% of the video duration
  };

  const onPlayerEnd = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0, true); // Restart the video from the beginning
    }
  };

  useEffect(() => {
    if (isMobile && playerRef.current) {
      playerRef.current.seekTo(0, true); // Restart the video from the beginning for mobile iframe
    }
  }, [isMobile]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        {videoId && (
          <>
            {!isMobile ? (
              <YouTube
                videoId={videoId}
                opts={{
                  width: '100%',
                  height: '400px',
                  playerVars: {
                    autoplay: 1, // Auto-play the video
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    fs: 0,
                    disablekb: 1,
                    playsinline: 1,
                  },
                }}
                onReady={onPlayerReady}
                onEnd={onPlayerEnd}
              />
            ) : (
              <iframe
                ref={playerRef}
                width="100%"
                height="280vh"
                src={`http://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                // allowFullScreen
                title="YouTube video player"
              ></iframe>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onAddToQueue} color="primary" variant="contained">
          Add to Queue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoPopup;
