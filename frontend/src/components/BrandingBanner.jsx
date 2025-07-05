// src/components/BrandingBanner.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const wiggle = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); } // Reduced bounce height
`;

const BannerContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px', // Reduced gap
});

const BouncingImage = styled('img')({
  height: '32px', // Reduced image height
  animation: `${bounce} 1s ease-in-out infinite`,
});

const WigglingText = styled(Typography)({
  display: 'inline-block',
  color: '#fff',
  fontWeight: 'bold',
  animation: `${wiggle} 0.4s ease-in-out infinite`,
});

const BrandingBanner = () => {
  return (
    <BannerContainer>
      <BouncingImage src="/websiteBanner.png" alt="KaraYouke Banner" />
      <WigglingText variant="h6"> {/* Reduced variant from h5 to h6 */}
        KaraYouke🎤🎶
      </WigglingText>
    </BannerContainer>
  );
};

export default BrandingBanner;