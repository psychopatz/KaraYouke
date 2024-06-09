import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrCodeScanner = ({ onScanSuccess }) => {
  const scannerRef = useRef(null);
  const scannerId = 'html5-qrcode-scanner';

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      scannerId, 
      { fps: 10, qrbox: 250 },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanError);

    function onScanError(error) {
      // handle scan error, if needed
      console.error(error);
    }

    // Cleanup the scanner on component unmount
    return () => {
      scanner.clear().catch(error => console.error('Failed to clear scanner.', error));
    };
  }, [onScanSuccess]);

  return <div id={scannerId} ref={scannerRef} style={{ width: '100%' }} />;
};

export default QrCodeScanner;
