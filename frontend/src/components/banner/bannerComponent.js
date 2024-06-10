import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/system';

const wiggle = keyframes`
  0%, 100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const StyledTypography = styled(Typography)`
  display: inline-block;
  color: #fff;
  animation: ${wiggle} 0.3s infinite;
`;

const StyledBanner = styled(Box)`
  animation: ${bounce} 1s infinite;
`;

const BannerComponent = () => {
  return (
    <>
      <StyledBanner component="img" src="/websiteBanner.png" alt="Website Banner" sx={{ height: 40 }} />
      <StyledTypography variant="h5" sx={{ fontSize: "100%" }}>
        KaraYouke🎤🎶
      </StyledTypography>
    </>
  );
}

export default BannerComponent;
