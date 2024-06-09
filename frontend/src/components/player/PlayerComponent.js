import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { useParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import QualitySelector from './QualitySelector';
import localStorageAPI from '../../API/localStorageAPI';
import PlayerEnding from './PlayerEnding';

const FullPageContainer = styled(Box)({
  position: 'relative',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  backgroundColor: 'black',
});

const BackgroundVideo = styled(Box)(({ videoEnded }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  filter: videoEnded ? 'brightness(10%)' : 'brightness(100%)', // Darkens the video when the video ends
}));

const YouTubeWrapper = styled(Box)({
  width: '100vw',
  height: '100vh',
  '& iframe': {
    width: '100vw',
    height: '100vh',
    pointerEvents: 'auto',
    border: 'none',
  },
});

const ContentContainer = styled(Box)({
  position: 'relative',
  zIndex: 1,
  color: '#fff',
  textAlign: 'center',
  pointerEvents: 'none',
});

const PlayerComponent = () => {
  const { videoID } = useParams();
  const playerRef = useRef(null);
  const [quality, setQuality] = useState('default');
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const savedQuality = localStorageAPI.getItem('videoQuality');
    if (savedQuality) {
      setQuality(savedQuality);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && playerRef.current.getInternalPlayer) {
      const player = playerRef.current.getInternalPlayer();
      player.setPlaybackQuality(quality);
    }
  }, [quality]);

  const handleQualityChange = (event) => {
    const selectedQuality = event.target.value;
    setQuality(selectedQuality);
    localStorageAPI.setItem('videoQuality', selectedQuality);
    if (playerRef.current && playerRef.current.getInternalPlayer) {
      const player = playerRef.current.getInternalPlayer();
      player.setPlaybackQuality(selectedQuality);
    }
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    event.target.setPlaybackQuality(quality);
    try {
      event.target.playVideo();
    } catch (error) {
      console.error('Error attempting to play video:', error);
    }
    setTimeout(() => {
      if (event.target.getPlayerState() !== window.YT.PlayerState.PLAYING) {
        try {
          event.target.playVideo();
        } catch (error) {
          console.error('Error attempting to play video on fallback:', error);
        }
      }
    }, 1000);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      setVideoEnded(true);
    }
  };

  const opts = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      fs: 0,
      disablekb: 0,
      playsinline: 1,
    },
  };

  return (
    <FullPageContainer>
      <BackgroundVideo videoEnded={videoEnded}>
        <YouTubeWrapper>
          <YouTube 
            videoId={videoID} 
            opts={opts} 
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            onError={(e) => console.error('YouTube Player Error:', e.data)}
          />
        </YouTubeWrapper>
      </BackgroundVideo>
      {videoEnded && <PlayerEnding />}
      <ContentContainer>
        <Typography variant="h4">Playing Video: {videoID}</Typography>
        <Box sx={{ pointerEvents: 'auto' }}>
          <QualitySelector quality={quality} onQualityChange={handleQualityChange} />
        </Box>
      </ContentContainer>
    </FullPageContainer>
  );
};

export default PlayerComponent;
