import React, { useState, useEffect, } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import GOOGLE_MAPS_API_KEY from '../../config/maps';
import RoomRating from './ReviewRating';
import * as Location from 'expo-location';
const { width } = Dimensions.get('window');

const defaultImage = require('../../../assets/photo/pac1.jpg');

const RoomDetails = ({ route, navigation }) => {
  const { room } = route.params;
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
    
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission denied");
          return;
        }
      }

      // Get the current location using expo-location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    };

    getLocation();
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    // try {
    //   const granted = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //     {
    //       title: "Location Permission",
    //       message: "This app needs access to your location to show the room on the map.",
    //       buttonNeutral: "Ask Me Later",
    //       buttonNegative: "Cancel",
    //       buttonPositive: "OK"
    //     }
    //   );
    //   setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    // } catch (err) {
    //   console.warn(err);
    // }
  };

  // Ensure room object has all required properties with defaults
  const safeRoom = {
    image: defaultImage,
    title: 'Room Details',
    rating: '4.0',
    location: 'Location not specified',
    description: 'No description available',
    amenities: [],
    gallery: [],
    price: '0',
    coordinates: {
      latitude: 19.0760,  // Default coordinates (Mumbai)
      longitude: 72.8777,
    },
    ...room
  };

  const handleGetDirections = (coordinates) => {
    const latLng = `${coordinates.latitude},${coordinates.longitude}`;
    const url = `google.navigation:q=${latLng}`;
    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps app or web
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latLng}`);
    });
  };

  // Custom map style
  const mapStyle = [
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e9e9e9"
        },
        {
          "lightness": 17
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        },
        {
          "lightness": 20
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "lightness": 17
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "lightness": 29
        },
        {
          "weight": 0.2
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "lightness": 18
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "lightness": 16
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        },
        {
          "lightness": 21
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dedede"
        },
        {
          "lightness": 21
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={safeRoom.image || defaultImage}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{safeRoom.title}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{safeRoom.rating}</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.location}>{safeRoom.location}</Text>
          </View>

          <Text style={styles.description}>{safeRoom.description}</Text>

          {/* Room Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="bed" size={24} color="#666" />
              <Text style={styles.infoText}>2 Beds</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={24} color="#666" />
              <Text style={styles.infoText}>Max 3 Guests</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="resize" size={24} color="#666" />
              <Text style={styles.infoText}>300 sq ft</Text>
            </View>
          </View>

          {/* Amenities */}
          {safeRoom.amenities.length > 0 && (
            <>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
                {safeRoom.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons 
                      name={
                        amenity.toLowerCase().includes('wifi') ? 'wifi' :
                        amenity.toLowerCase().includes('ac') ? 'snow' :
                        amenity.toLowerCase().includes('tv') ? 'tv' :
                        amenity.toLowerCase().includes('parking') ? 'car' : 'checkmark-circle'
                      } 
                      size={20} 
                      color="#007AFF" 
                    />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Gallery */}
          {safeRoom.gallery.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.gallery}
              >
                {safeRoom.gallery.map((image, index) => (
                  <Image 
                key={index}
                    source={image}
                    style={styles.galleryImage}
                    resizeMode="cover"
              />
            ))}
              </ScrollView>
            </>
          )}

          {/* Rules */}
          <Text style={styles.sectionTitle}>House Rules</Text>
          <View style={styles.rulesContainer}>
            <Text style={styles.ruleText}>• Check-in: After 2:00 PM</Text>
            <Text style={styles.ruleText}>• Check-out: Before 12:00 PM</Text>
            <Text style={styles.ruleText}>• No smoking</Text>
            <Text style={styles.ruleText}>• No parties or events</Text>
          </View>

          {/* Ratings & Reviews */}
          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
          <RoomRating />

          {/* Location Map */}
          <Text style={styles.sectionTitle}>Location</Text>
          <MapView
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
          <View style={styles.container}>
            {location ? (
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
                {/* <Marker
                  coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                  title={"Your Location"}
                  description={"This is your current location"}
                /> */}
              </MapView>
            ) : (
              <View style={styles.loadingContainer}>
                <Text>{errorMsg ? errorMsg : "Loading..."}</Text>
              </View>
            )}
          </View>

          {/* Google Maps Embed */}
          {/* <Text style={styles.sectionTitle}>Detailed Location</Text> */}
          <View style={styles.webviewContainer}>
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
                        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13527.35626574276!2d86.71890803696658!3d24.797525396589517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1748942766054!5m2!1sen!2sin"
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
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price per night</Text>
          <Text style={styles.price}>${safeRoom.price}<Text style={styles.perNight}>/night</Text></Text>
        </View>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  rating: {
    marginLeft: 5,
    color: '#FFB800',
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  location: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    marginTop: 5,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  rulesContainer: {
    marginBottom: 20,
  },
  ruleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  gallery: {
    marginBottom: 20,
  },
  galleryImage: {
    width: width * 0.6,
    height: width * 0.4,
    borderRadius: 10,
    marginRight: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  perNight: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Location Styles
  locationMapContainer: {
    marginBottom: 20,
  },
  mapContainer: {
    marginBottom: 10,
  },
  mapImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  markerContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationDetails: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  webviewContainer: {
    height: 400,
    width: '100%',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
});

export default RoomDetails; 
