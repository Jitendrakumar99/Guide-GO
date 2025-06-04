// Web-compatible mock for react-native-maps
import React from 'react';

const MapView = ({ children, ...props }) => (
  <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }}>
    {children}
  </div>
);

const Marker = ({ children, ...props }) => (
  <div style={{ position: 'absolute', transform: 'translate(-50%, -100%)' }}>
    {children}
  </div>
);

const PROVIDER_GOOGLE = 'google';
const PROVIDER_DEFAULT = 'default';

export {
  MapView,
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT
}; 