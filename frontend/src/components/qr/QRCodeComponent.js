import React from 'react';
import QRCode from 'react-qr-code';
import PropTypes from 'prop-types';

const QRCodeComponent = ({ text, size = 256 }) => {
  return (
    <div style={{ width: size, height: size }}>
      <QRCode value={text} size={size} />
    </div>
  );
};

QRCodeComponent.propTypes = {
  text: PropTypes.string.isRequired,
  size: PropTypes.number,
};

QRCodeComponent.defaultProps = {
  size: 128,
};

export default QRCodeComponent;
