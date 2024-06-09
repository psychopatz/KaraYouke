import React from 'react';
import QRCode from 'react-qr-code';
import PropTypes from 'prop-types';

const QrCodeGenerator = ({ text, size = 256 }) => {
  return (
    <div style={{ width: size, height: size }}>
      <QRCode value={text} size={size} />
    </div>
  );
};

QrCodeGenerator.propTypes = {
  text: PropTypes.string.isRequired,
  size: PropTypes.number,
};

QrCodeGenerator.defaultProps = {
  size: 128,
};

export default QrCodeGenerator;
