import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getUserById, updateUser } from '../../utils/api';
import MapComponent from '../../components/MapComponent';

const EditProfile = ({ navigation, route }) => {
  const { onProfileUpdate } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: null,
    profilePic: null,
    address: '',
  });
  const [image, setImage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const latestUser = await getUserById();
        setFormData({
          name: latestUser.name || '',
          email: latestUser.email || '',
          phone: latestUser.phone || '',
          location: latestUser.location
            ? {
                type: 'Point',
                coordinates: latestUser.location.coordinates,
              }
            : null,
          profilePic: latestUser.profilePic || null,
          address: latestUser.address || '',
        });
        setImage(latestUser.profilePic ? { uri: latestUser.profilePic } : null);
        
        // Set selected location for map
        if (latestUser.location && latestUser.location.coordinates) {
          setSelectedLocation({
            latitude: latestUser.location.coordinates[1],
            longitude: latestUser.location.coordinates[0],
          });
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setFormData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // GeoJSON format: [lng, lat]
      }
    }));
  };

  const handleLocationInput = (value) => {
    // Parse coordinates from text input
    const coords = value.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2) {
      const [lat, lng] = coords;
      if (validateCoordinates(lat, lng)) {
        setSelectedLocation({ latitude: lat, longitude: lng });
        setFormData(prev => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON format: [lng, lat]
          }
        }));
      } else {
        Alert.alert('Invalid Coordinates', 'Please enter valid coordinates:\nLatitude: -90 to 90\nLongitude: -180 to 180');
      }
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Check location permissions first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access in your device settings to use this feature.'
        );
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 10,
      });
      
      setSelectedLocation({ latitude: coords.latitude, longitude: coords.longitude });
      setFormData(prev => ({
        ...prev,
        location: {
          type: 'Point',
          coordinates: [coords.longitude, coords.latitude]
        }
      }));
      Alert.alert('Success', 'Location updated successfully!');
    } catch (error) {
      let errorMessage = 'Unable to get current location';
      
      if (error.code === 'LOCATION_UNAVAILABLE') {
        errorMessage = 'Location information is unavailable. Please check your GPS settings.';
      } else if (error.code === 'LOCATION_TIMEOUT') {
        errorMessage = 'Location request timed out. Please try again.';
      } else if (error.code === 'LOCATION_PERMISSION_DENIED') {
        errorMessage = 'Location permission denied. Please enable location access in your device settings.';
      } else {
        errorMessage = 'An error occurred while getting your location. Please try again.';
      }
      
      Alert.alert('Location Error', errorMessage);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        setImage({ uri: selectedImage.uri });
        
        // Convert image to base64 for upload
        if (selectedImage.base64) {
          const base64Image = `data:image/jpeg;base64,${selectedImage.base64}`;
          setFormData(prev => ({
            ...prev,
            profilePic: base64Image
          }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }

      // Update user data
      const updatedUser = await updateUser(formData);
      
      // Call the onProfileUpdate callback with the updated data
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const validateCoordinates = (lat, lng) => {
    if (isNaN(lat) || isNaN(lng)) {
      return false;
    }
    if (lat < -90 || lat > 90) {
      return false;
    }
    if (lng < -180 || lng > 180) {
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileImageContainer}>
          <Image
            source={image || require('../../../assets/photo/08.png')}
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={pickImage}
            disabled={loading}
          >
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder="Enter your full name"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              editable={!loading}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
          <View style={styles.inputContainer}>  
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleChange('address', value)}
              placeholder="Enter your address"
              editable={!loading}
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.locationHeader}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.locationButtons}>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() => setShowMap(!showMap)}
                  disabled={loading}
                >
                  <Ionicons 
                    name={showMap ? "map-outline" : "map"} 
                    size={20} 
                    color="#007AFF" 
                  />
                  <Text style={styles.locationButtonText}>
                    {showMap ? 'Hide Map' : 'Show Map'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                  disabled={loading}
                >
                  <Ionicons name="locate" size={20} color="#007AFF" />
                  <Text style={styles.locationButtonText}>Current</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {showMap && (
              <View style={styles.mapContainer}>
                <MapComponent
                  initialRegion={
                    selectedLocation
                      ? {
                          latitude: selectedLocation.latitude,
                          longitude: selectedLocation.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }
                      : {
                          latitude: 37.78825,
                          longitude: -122.4324,
                          latitudeDelta: 0.0922,
                          longitudeDelta: 0.0421,
                        }
                  }
                  showUserLocation={true}
                  showMapTypeSwitch={false}
                  showSearch={true}
                  showDirections={false}
                  markers={
                    selectedLocation
                      ? [
                          {
                            coordinate: selectedLocation,
                            title: 'Selected Location',
                            description: 'Your selected location',
                            pinColor: 'red',
                          },
                        ]
                      : []
                  }
                  onMapPress={handleMapPress}
                  style={styles.map}
                />
              </View>
            )}
            
            <TextInput
              style={styles.input}
              value={formData.location?.coordinates ? 
                `${formData.location.coordinates[1]}, ${formData.location.coordinates[0]}` : 
                ''}
              onChangeText={handleLocationInput}
              placeholder="Enter coordinates (latitude, longitude)"
              editable={!loading}
            />
            {formData.location?.coordinates && (
              <Text style={styles.coordinatesDisplay}>
                Current: {formData.location.coordinates[1].toFixed(6)}, {formData.location.coordinates[0].toFixed(6)}
              </Text>
            )}
            <Text style={styles.locationHint}>
              Tap on the map to select location or enter coordinates manually
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    opacity: 1,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoButton: {
    padding: 8,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  locationButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4,
  },
  mapContainer: {
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  locationHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  coordinatesDisplay: {
    color: '#007AFF',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default EditProfile;