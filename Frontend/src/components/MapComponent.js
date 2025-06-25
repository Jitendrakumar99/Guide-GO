import React, { useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';

const GOOGLE_MAPS_APIKEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'; // <-- Set your key here

const MapComponent = ({
  initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  showUserLocation = true,
  showMapTypeSwitch = true,
  showSearch = true,
  showDirections = false,
  origin,
  destination,
  markers = [],
  onMapPress,
  onMarkerDragEnd,
  style,
}) => {
  const mapRef = useRef(null);
  const [region, setRegion] = useState(initialRegion);
  const [mapType, setMapType] = useState('standard');
  const [searchLocation, setSearchLocation] = useState(null);

  // Ensure markers is always an array
  const safeMarkers = Array.isArray(markers) ? markers : [];
  
  // Map type switcher
  const toggleMapType = () => {
    setMapType((prev) =>
      prev === 'standard' ? 'satellite' : prev === 'satellite' ? 'hybrid' : 'standard'
    );
  };

  // Center map on user location
  const centerOnUser = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {showSearch && GOOGLE_MAPS_APIKEY && GOOGLE_MAPS_APIKEY !== 'YOUR_API_KEY' && (
        <GooglePlacesAutocomplete
          placeholder="Search"
          fetchDetails
          onPress={(data, details = null) => {
            if (details && details.geometry && details.geometry.location) {
              const loc = details.geometry.location;
              setSearchLocation({
                latitude: loc.lat,
                longitude: loc.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
              setRegion({
                latitude: loc.lat,
                longitude: loc.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
              if (mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: loc.lat,
                  longitude: loc.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }, 1000);
              }
            }
          }}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: 'en',
          }}
          styles={{
            container: { position: 'absolute', width: '100%', zIndex: 2, top: 10 },
            listView: { backgroundColor: 'white' },
          }}
          enablePoweredByContainer={false}
          onFail={error => console.log('GooglePlacesAutocomplete error:', error)}
        />
      )}

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        region={region}
        mapType={mapType}
        showsUserLocation={showUserLocation}
        onRegionChangeComplete={setRegion}
        onPress={onMapPress}
      >
        {/* Markers */}
        {safeMarkers.map((marker, idx) => {
          if (!marker || !marker.coordinate) {
            return null;
          }
          return (
            <Marker
              key={idx}
              coordinate={marker.coordinate}
              title={marker.title || ''}
              description={marker.description || ''}
              draggable={marker.draggable || false}
              onDragEnd={e => onMarkerDragEnd && onMarkerDragEnd(e.nativeEvent.coordinate, marker, idx)}
              pinColor={marker.pinColor || 'red'}
              image={marker.icon}
            />
          );
        })}
        {/* Search marker */}
        {searchLocation && (
          <Marker
            coordinate={searchLocation}
            title="Searched Location"
            pinColor="blue"
          />
        )}
        {/* Directions/Polyline */}
        {showDirections && origin && destination && GOOGLE_MAPS_APIKEY && GOOGLE_MAPS_APIKEY !== 'YOUR_API_KEY' && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="hotpink"
            onReady={result => {
              if (mapRef.current && result && result.coordinates) {
                mapRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                });
              }
            }}
            onError={errorMessage => console.log('Directions error:', errorMessage)}
          />
        )}
      </MapView>

      {/* Map type switcher */}
      {showMapTypeSwitch && (
        <TouchableOpacity style={styles.mapTypeButton} onPress={toggleMapType}>
          <Ionicons name="layers-outline" size={24} color="#007AFF" />
          <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>{mapType}</Text>
        </TouchableOpacity>
      )}

      {/* Center on user button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
        <Ionicons name="locate" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapTypeButton: {
    position: 'absolute',
    top: 70,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 3,
    elevation: 3,
  },
  centerButton: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    zIndex: 3,
    elevation: 3,
  },
});

export default MapComponent; 