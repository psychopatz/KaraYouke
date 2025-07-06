// src/components/DynamicQRCode.jsx

import React from 'react';
import QRCode from 'react-qr-code';
import { Box } from '@mui/material';

/**
 * A reusable component to generate a QR code for any given string value.
 * It ensures scannability by rendering on a white background with padding.
 * @param {object} props
 * @param {string} props.value - The string (e.g., URL) to encode in the QR code.
 * @param {number} [props.size=128] - The width and height of the QR code in pixels.
 * @param {object} [props.sx] - Custom MUI styles to be applied to the wrapper box.
 */
const DynamicQRCode = ({ value, size = 128, sx }) => {
  // Don't render anything if there's no value to encode.
  if (!value) {
    return null;
  }

  return (
    // This Box provides the white background and padding ("quiet zone")
    // which is essential for QR code scanners to work reliably.
    <Box
      sx={{
        p: '8px', // Padding around the QR code
        bgcolor: 'white',
        display: 'inline-block',
        lineHeight: 0, // Removes extra space below the SVG
        ...sx, // Allows for custom styling like shadows from the parent
      }}
    >
      <QRCode value={value} size={size} />
    </Box>
  );
};

export default DynamicQRCode;