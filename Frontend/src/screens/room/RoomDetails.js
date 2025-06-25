import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import ReviewRating  from './ReviewRating';
import { checkListingOwnership, createBooking, getCurrentUser } from '../../utils/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapComponent from '../../components/MapComponent';
const { width } = Dimensions.get('window');
const defaultImage = require('../../../assets/photo/pac1.jpg');
const backend_url = "http://10.16.54.141:3000"||process.env.backend_url;

const RoomDetails = ({ route, navigation }) => {
  const { room } = route.params;
  // Ensure room object has all required properties with defaults
  const safeRoom = {
    _id: room.id || room._id || '',
    title: room.title || 'Room Details',
    description: room.description || 'No description available',
    pricePerNight: room.pricePerNight || room.price || 0,
    rating: room.rating || '0.0',
    location: room.address || 'Location not specified',
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
    gallery: Array.isArray(room.gallery) ? room.gallery : [],
    images: Array.isArray(room.images) ? room.images : [],
    capacity: room.capacity || 2,
    type: room.type || 'Standard',
    coordinates: room.coordinates || {
      latitude: 19.0760,
      longitude: 72.8777,
    },
    owner: room.owner ? {
      _id: room.owner.id || room.owner._id,
      name: room.owner.name || '',
      profilePic: room.owner.profilePic || null
    } : null,
    ...room
  };

  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

  useEffect(() => {
    checkOwnership();
  }, []);
  console.log("backend_url",backend_url);
  const checkOwnership = async () => {
    try {
      const owner = await checkListingOwnership(safeRoom._id, 'room');
      setIsOwner(owner);
    } catch (error) {
      console.error('Error checking ownership:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerMode === 'start') {
        setStartDate(selectedDate);
        // Set end date to next day if it's before start date
        if (endDate <= selectedDate) {
          setEndDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
        }
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const handleBookNow = async () => {
    if (isOwner) {
      Alert.alert('Cannot Book', 'You cannot book your own listing.');
      return;
    }

    try {
      // Get current user data for validation
      const userData = await getCurrentUser();
      if (!userData) {
        throw new Error('Please login to book a room');
      }

      // Format the room data for booking
      const bookingData = {
        _id: safeRoom._id,
        title: safeRoom.title,
        description: safeRoom.description,
        pricePerNight: safeRoom.pricePerNight || safeRoom.price,
        images: safeRoom.images,
        amenities: safeRoom.amenities,
        location: safeRoom.location,
        coordinates: safeRoom.coordinates,
        owner: {
          _id: safeRoom.owner?.id || safeRoom.owner?._id,
          name: safeRoom.owner?.name || '',
          profilePic: safeRoom.owner?.profilePic || null
        }
      };

      // Navigate to booking form with formatted room data
      navigation.navigate('BookingForm', {
        listing: bookingData,
        listingType: 'room'
      });
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.message || 'Failed to proceed with booking');
    }
  };

  const calculateTotalPrice = () => {
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return nights * (safeRoom.pricePerNight || 0);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleGetDirections = (coordinates) => {
    const latLng = `${coordinates.latitude},${coordinates.longitude}`;
    const url = `google.navigation:q=${latLng}`;
    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps app or web
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latLng}`);
    });
  };

  const renderGalleryItem = ({ item, index }) => (
    <Image 
      key={index}
      source={typeof item === 'string' ? { uri: item } : item}
      style={styles.galleryImage}
      resizeMode="cover"
    />
  );

  const renderContent = () => (
    <>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={safeRoom.images.length > 0 ? { uri: `${backend_url}/${safeRoom.images[0]}` } : defaultImage}
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
            <Text style={styles.infoText}>{safeRoom.capacity} Beds</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={24} color="#666" />
            <Text style={styles.infoText}>Max {safeRoom.maxGuests || '3'} Guests</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="resize" size={24} color="#666" />
            <Text style={styles.infoText}>{safeRoom.size || '300'} sq ft</Text>
            </View>
          </View>

          {/* Amenities */}
        {Array.isArray(safeRoom.amenities) && safeRoom.amenities.length > 0 && (
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
        {Array.isArray(safeRoom.gallery) && safeRoom.gallery.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.gallery}
              >
                {safeRoom.gallery.map((item, index) => (
                  <Image 
                    key={index}
                    source={typeof item === 'string' ? { uri: item } : item}
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
          <ReviewRating itemId={safeRoom._id} itemType="room" />

<Text style={styles.sectionTitle}>Location</Text>
      <MapComponent
        initialRegion={{
          latitude: safeRoom.coordinates.latitude,
          longitude: safeRoom.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}  
        markers={[
          {
            coordinate: safeRoom.coordinates,
            title: safeRoom.title,
            description: safeRoom.description,
          },  
        ]}
        style={styles.map}
      />

      {/* Location Map */}  
          {/* Location Map */}
          
          {/* <View style={styles.webviewContainer}>
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
          </View> */}
        </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading room details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {isOwner ? (
          <View style={styles.ownerMessage}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.ownerMessageText}>This is your listing</Text>
          </View>
        ) : (
          <>
            <View style={styles.bookingContainer}>
              <View style={styles.dateContainer}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    setDatePickerMode('start');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.dateLabel}>Check-in</Text>
                  <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    setDatePickerMode('end');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.dateLabel}>Check-out</Text>
                  <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
              </View>
        <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Total Price</Text>
                <Text style={styles.price}>₹{calculateTotalPrice()}</Text>
              </View>
        </View>
            <TouchableOpacity 
              style={[styles.bookButton, bookingLoading && styles.bookButtonDisabled]}
              onPress={handleBookNow}
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
          <Text style={styles.bookButtonText}>Book Now</Text>
              )}
        </TouchableOpacity>
          </>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={datePickerMode === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={datePickerMode === 'end' ? startDate : new Date()}
        />
      )}
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
  bookingContainer: {
    flex: 1,
    marginRight: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateButton: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  ownerMessage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F2FF',
    padding: 15,
    borderRadius: 8,
  },
  ownerMessageText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
});

export default RoomDetails; 
