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
  50% { transform: translateY(-8px); }
`;

// Pass the 'size' prop to control styling dynamically
const BannerContainer = styled(Box)(({ size }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: size === 'large' ? '12px' : '8px',
}));

const BouncingImage = styled('img')(({ size }) => ({
  height: size === 'large' ? '60px' : '32px', // Larger image for the 'large' size
  animation: `${bounce} 1s ease-in-out infinite`,
}));

const WigglingText = styled(Typography)({
  display: 'inline-block',
  color: '#fff',
  fontWeight: 'bold',
  animation: `${wiggle} 0.4s ease-in-out infinite`,
});

/**
 * A reusable branding banner that can be rendered in different sizes.
 * @param {object} props
 * @param {'small' | 'large'} [props.size='small'] - The size of the banner.
 */
const BrandingBanner = ({ size = 'small' }) => {
  return (
    <BannerContainer size={size}>
      <BouncingImage src="/websiteBanner.png" alt="KaraYouke Banner" size={size} />
      {/* Use a larger typography variant for the 'large' size */}
      <WigglingText variant={size === 'large' ? 'h4' : 'h6'}>
        KaraYouke🎤🎶
      </WigglingText>
    </BannerContainer>
  );
};

export default BrandingBanner;