import React from 'react';
import { StatusBar as RNStatusBar } from 'react-native';

const StatusBar = ({ backgroundColor = 'transparent', barStyle = 'light-content' }) => {
  return (
    <RNStatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      translucent={false}
      animated={true}
    />
  );
};

export default StatusBar; 