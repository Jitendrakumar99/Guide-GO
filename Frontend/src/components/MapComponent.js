import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

const MapComponent = ({ location, style }) => {
  if (Platform.OS === 'web') {
    // Web implementation using Google Maps iframe
    return (
      <View style={[styles.container, style]}>
        <WebView
          source={{
            html: `
              <!DOCTYPE html>
              <html style="height: 100%; margin: 0; padding: 0;">
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    html, body { 
                      height: 100%; 
                      margin: 0; 
                      padding: 0; 
                      overflow: hidden;
                    }
                    iframe { 
                      width: 100%; 
                      height: 100%; 
                      border: 0;
                      position: absolute;
                      top: 0;
                      left: 0;
                      right: 0;
                      bottom: 0;
                    }
                  </style>
                </head>
                <body>
                  <iframe 
                    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDdIriSwDafxF_IudsJtC5_cGgk67xhfYo&q=${location.latitude},${location.longitude}"
                    width="100%"
                    height="100%"
                    style="border:0;"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                  </iframe>
                </body>
              </html>
            `
          }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    );
  }

  // Native implementation using react-native-maps
  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Location"
          description="This is the location"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
  },
});

export default MapComponent; 