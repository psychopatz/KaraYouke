import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';

const QrCodeScanner = ({ onScanSuccess, onScanError, width = 300, height = 300 }) => {
  const qrCodeRegionId = 'html5qr-code-full-region';
  const qrCodeScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const qrCodeScanner = new Html5Qrcode(qrCodeRegionId);
    qrCodeScannerRef.current = qrCodeScanner;

    const startScanner = async () => {
      try {
        await qrCodeScanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: width, height: height },
          },
          (decodedText, decodedResult) => {
            onScanSuccess(decodedText, decodedResult);
          },
          (errorMessage) => {
            onScanError(errorMessage);
          }
        );
        setIsScanning(true);
      } catch (err) {
        setErrorMessage('Failed to start QR code scanner. Please ensure camera access is allowed.');
        console.error('Failed to start QR code scanner', err);
      }
    };

    startScanner();

    return () => {
      if (qrCodeScannerRef.current && isScanning) {
        qrCodeScannerRef.current.stop().then(() => {
          qrCodeScannerRef.current.clear();
          setIsScanning(false);
        }).catch((err) => {
          console.error('Failed to stop QR code scanner', err);
        });
      }
    };
  }, [onScanSuccess, onScanError, width, height, isScanning]);

  const handleStopClick = () => {
    if (qrCodeScannerRef.current && isScanning) {
      qrCodeScannerRef.current.stop().then(() => {
        qrCodeScannerRef.current.clear();
        setIsScanning(false);
      }).catch((err) => {
        console.error('Failed to stop QR code scanner', err);
      });
    }
  };

  return (
    <Box>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
      <div id={qrCodeRegionId} style={{ width: width, height: height }} />
      <Button onClick={handleStopClick} variant="contained" color="secondary">
        Stop Scanner
      </Button>
    </Box>
  );
};

export default QrCodeScanner;
