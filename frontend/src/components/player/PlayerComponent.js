import React from 'react';
import { useParams } from "react-router-dom";
import { RoomProvider } from "../songQueue/RoomContext"; 
import DisplayPlayer from "./DisplayPlayer";
import DisplaySongQueue from '../songQueue/DisplaySongQueue';
import styled from '@emotion/styled';
import { Box } from '@mui/material';


const ContentContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1,
  pointerEvents: 'none',
});

const PlayerComponent = () => {
  const { roomID } = useParams();
  return (
    <RoomProvider currentRoom={roomID}> 
      <ContentContainer>
        
        <DisplaySongQueue />
      </ContentContainer>
      <DisplayPlayer />
    </RoomProvider>
  );
}

export default PlayerComponent;
