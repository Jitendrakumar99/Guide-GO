import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, updateRoom, updateVehicle, getRoomById, getVehicleById } from '../../utils/api';
import MapComponent from '../../components/MapComponent';
import { getCurrentLocation } from '../../utils/helpers';

const EditListingScreen = ({ route, navigation }) => {
  const { id, type } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    location: {
      type: 'Point',
      coordinates: ['', ''], // [longitude, latitude]
    },
    amenities: '', // comma-separated string
    status: 'draft',
    available: true,
  });

  const [roomData, setRoomData] = useState({
    type: '',
    rating: '',
    capacity: '',
    pricePerNight: '',
  });

  const [vehicleData, setVehicleData] = useState({
    vehicleType: 'Car',
    brand: '',
    model: '',
    registrationNumber: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    rating: '',
    capacity: '',
    pricePerDay: '',
  });

  useEffect(() => {
    // Reset all state to initial values
    setFormData({
      title: '',
      description: '',
      address: '',
      location: { type: 'Point', coordinates: ['', ''] },
      amenities: '',
      status: 'draft',
      available: true,
    });
    setRoomData({
      type: '',
      rating: '',
      capacity: '',
      pricePerNight: '',
    });
    setVehicleData({
      vehicleType: 'Car',
      brand: '',
      model: '',
      registrationNumber: '',
      fuelType: 'Petrol',
      transmission: 'Manual',
      rating: '',
      capacity: '',
      pricePerDay: '',
    });
    setExistingImages([]);
    setImages([]);
    setDeletedImages([]);
    fetchListingData();
  }, [id, type]);

  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  const fetchListingData = async () => {
    try {
      setLoading(true);
      let data;
      if (type === 'room') {
        data = await getRoomById(id);
        console.log('Fetched room data:', data);
        setRoomData({
          type: data.type || '',
          rating: data.rating?.toString() || '',
          capacity: data.capacity?.toString() || '',
          pricePerNight: data.pricePerNight?.toString() || '',
        });
      } else {
        data = await getVehicleById(id);
        console.log('Fetched vehicle data:', data);
        setVehicleData({
          vehicleType: data.vehicleType || 'Car',
          brand: data.brand || '',
          model: data.model || '',
          registrationNumber: data.registrationNumber || '',
          fuelType: data.fuelType || 'Petrol',
          transmission: data.transmission || 'Manual',
          rating: data.rating?.toString() || '',
          capacity: data.capacity?.toString() || '',
          pricePerDay: data.pricePerDay?.toString() || '',
        });
      }

      console.log('Location data:', data.location);
      console.log('Coordinates:', data.location?.coordinates);

      // Set common form data
      setFormData({
        title: data.title || '',
        description: data.description || '',
        address: data.address || '',
        location: {
          type: 'Point',
          coordinates: data.location?.coordinates ? [
            data.location.coordinates[0]?.toString() || '',
            data.location.coordinates[1]?.toString() || ''
          ] : ['', ''],
        },
        amenities: Array.isArray(data.amenities) ? data.amenities.join(', ') : '',
        status: data.status || 'draft',
        available: data.available ?? true,
      });

      // Set existing images
      if (Array.isArray(data.images)) {
        setExistingImages(data.images);
      }
      setDeletedImages([]); // Reset deleted images

    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch listing data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      // Show cropping options
      Alert.alert(
        'Select Image',
        'Choose how you want to crop your image:',
        [
          {
            text: 'Use Original',
            onPress: () => pickImage(false, null)
          },
          {
            text: 'Square Crop',
            onPress: () => pickImage(true, [1, 1])
          },
          {
            text: 'Free Crop',
            onPress: () => pickImage(true, null)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickImage = async (allowsEditing, aspect) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: allowsEditing,
        aspect: aspect,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleDeleteExistingImage = (index) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const imageToDelete = existingImages[index];
            setExistingImages(existingImages.filter((_, i) => i !== index));
            setDeletedImages([...deletedImages, imageToDelete]);
          }
        }
      ]
    );
  };

  const handleDeleteNewImage = (index) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setImages(images.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          coordinates: [location.longitude.toString(), location.latitude.toString()],
        },
      });
      Alert.alert('Success', 'Current location set successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please check location permissions.');
    }
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (const uri of images) {
      try {
        const url = await uploadImage(uri);
        uploadedUrls.push(url);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload images');
      }
    }
    // Return existing images minus deleted ones, plus new uploaded images
    const remainingExistingImages = existingImages.filter(img => !deletedImages.includes(img));
    return [...remainingExistingImages, ...uploadedUrls];
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      // Validate required fields
      if (!formData.title || !formData.description || !formData.address) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Validate coordinates
      const lon = parseFloat(formData.location.coordinates[0]);
      const lat = parseFloat(formData.location.coordinates[1]);
      if (isNaN(lon) || isNaN(lat)) {
        Alert.alert('Error', 'Please enter valid coordinates');
        return;
      }

      // Upload any new images
      const imageUrls = await uploadImages();

      // Prepare amenities array
      const amenitiesArr = formData.amenities
        ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : [];

      // Prepare the final data object
      let listingData = {
        ...formData,
        images: imageUrls,
        amenities: amenitiesArr,
        location: {
          type: 'Point',
          coordinates: [lon, lat],
        },
      };

      if (type === 'room') {
        listingData = {
          ...listingData,
          type: roomData.type,
          rating: roomData.rating ? parseFloat(roomData.rating) : 0,
          capacity: roomData.capacity ? parseInt(roomData.capacity) : 1,
          pricePerNight: roomData.pricePerNight ? parseFloat(roomData.pricePerNight) : 0,
        };
        await updateRoom(id, listingData);
      } else {
        listingData = {
          ...listingData,
          ...vehicleData,
          rating: vehicleData.rating ? parseFloat(vehicleData.rating) : 0,
          capacity: vehicleData.capacity ? parseInt(vehicleData.capacity) : 1,
          pricePerDay: vehicleData.pricePerDay ? parseFloat(vehicleData.pricePerDay) : 0,
        };
        await updateVehicle(id, listingData);
      }

      Alert.alert('Success', 'Listing updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const renderRoomFields = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Room Type *</Text>
        <Picker
          selectedValue={roomData.type}
          onValueChange={(value) => setRoomData({ ...roomData, type: value })}
          style={styles.picker}
        >
          <Picker.Item label="Select Room Type" value="" />
          <Picker.Item label="Deluxe" value="Deluxe" />
          <Picker.Item label="Suite" value="Suite" />
          <Picker.Item label="Standard" value="Standard" />
          <Picker.Item label="Executive" value="Executive" />
        </Picker>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Rating</Text>
        <TextInput
          style={styles.input}
          value={roomData.rating}
          onChangeText={(value) => setRoomData({ ...roomData, rating: value })}
          keyboardType="numeric"
          placeholder="Enter rating (0-5)"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Capacity *</Text>
        <TextInput
          style={styles.input}
          value={roomData.capacity}
          onChangeText={(value) => setRoomData({ ...roomData, capacity: value })}
          keyboardType="numeric"
          placeholder="Enter room capacity"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Price Per Night *</Text>
        <TextInput
          style={styles.input}
          value={roomData.pricePerNight}
          onChangeText={(value) => setRoomData({ ...roomData, pricePerNight: value })}
          keyboardType="numeric"
          placeholder="Enter price per night"
        />
      </View>
    </>
  );

  const renderVehicleFields = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Vehicle Type *</Text>
        <Picker
          selectedValue={vehicleData.vehicleType}
          onValueChange={(value) => setVehicleData({ ...vehicleData, vehicleType: value })}
          style={styles.picker}
        >
          <Picker.Item label="Car" value="Car" />
          <Picker.Item label="Bike" value="Bike" />
          <Picker.Item label="Scooter" value="Scooter" />
          <Picker.Item label="Bicycle" value="Bicycle" />
        </Picker>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Brand</Text>
        <TextInput
          style={styles.input}
          value={vehicleData.brand}
          onChangeText={(value) => setVehicleData({ ...vehicleData, brand: value })}
          placeholder="Enter vehicle brand"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          value={vehicleData.model}
          onChangeText={(value) => setVehicleData({ ...vehicleData, model: value })}
          placeholder="Enter vehicle model"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Registration Number</Text>
        <TextInput
          style={styles.input}
          value={vehicleData.registrationNumber}
          onChangeText={(value) => setVehicleData({ ...vehicleData, registrationNumber: value })}
          placeholder="Enter registration number"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fuel Type *</Text>
        <Picker
          selectedValue={vehicleData.fuelType}
          onValueChange={(value) => setVehicleData({ ...vehicleData, fuelType: value })}
          style={styles.picker}
        >
          <Picker.Item label="Petrol" value="Petrol" />
          <Picker.Item label="Diesel" value="Diesel" />
          <Picker.Item label="Electric" value="Electric" />
        </Picker>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Transmission *</Text>
        <Picker
          selectedValue={vehicleData.transmission}
          onValueChange={(value) => setVehicleData({ ...vehicleData, transmission: value })}
          style={styles.picker}
        >
          <Picker.Item label="Manual" value="Manual" />
          <Picker.Item label="Automatic" value="Automatic" />
        </Picker>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Rating</Text>
        <TextInput
          style={styles.input}
          value={vehicleData.rating}
          onChangeText={(value) => setVehicleData({ ...vehicleData, rating: value })}
          keyboardType="numeric"
          placeholder="Enter rating (0-5)"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Capacity *</Text>
        <TextInput
          style={styles.input}
          value={vehicleData.capacity}
          onChangeText={(value) => setVehicleData({ ...vehicleData, capacity: value })}
          keyboardType="numeric"
          placeholder="Enter vehicle capacity"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Price Per Day *</Text>
        <TextInput
          style={styles.input}
          value={vehicleData.pricePerDay}
          onChangeText={(value) => setVehicleData({ ...vehicleData, pricePerDay: value })}
          keyboardType="numeric"
          placeholder="Enter price per day"
        />
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading listing data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit {type === 'room' ? 'Room' : 'Vehicle'}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => setFormData({ ...formData, title: value })}
              placeholder="Enter listing title"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => setFormData({ ...formData, description: value })}
              placeholder="Enter listing description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => setFormData({ ...formData, address: value })}
              placeholder="Enter listing address"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location (Longitude, Latitude) *</Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={formData.location.coordinates[0]}
                onChangeText={value => setFormData({ ...formData, location: { ...formData.location, coordinates: [value, formData.location.coordinates[1]] } })}
                placeholder="Longitude"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={formData.location.coordinates[1]}
                onChangeText={value => setFormData({ ...formData, location: { ...formData.location, coordinates: [formData.location.coordinates[0], value] } })}
                placeholder="Latitude"
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={handleGetCurrentLocation}
              >
                <Ionicons name="locate" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Map for Location Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Location on Map</Text>
            <View style={styles.mapContainer}>
              <MapComponent
                initialRegion={{
                  latitude: parseFloat(formData.location.coordinates[1]) || 37.78825,
                  longitude: parseFloat(formData.location.coordinates[0]) || -122.4324,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showUserLocation={true}
                showMapTypeSwitch={true}
                showSearch={true}
                showDirections={false}
                markers={[
                  {
                    coordinate: {
                      latitude: parseFloat(formData.location.coordinates[1]) || 37.78825,
                      longitude: parseFloat(formData.location.coordinates[0]) || -122.4324,
                    },
                    title: formData.title || 'Selected Location',
                    description: formData.address || 'Tap to select location',
                    pinColor: 'red',
                    draggable: true,
                  },
                ]}
                onMarkerDragEnd={(coordinate) => {
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      coordinates: [coordinate.longitude.toString(), coordinate.latitude.toString()],
                    },
                  });
                }}
                onMapPress={(event) => {
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      coordinates: [longitude.toString(), latitude.toString()],
                    },
                  });
                }}
                style={styles.map}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status *</Text>
            <Picker
              selectedValue={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              style={styles.picker}
            >
              <Picker.Item label="Draft" value="draft" />
              <Picker.Item label="Published" value="published" />
            </Picker>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Available</Text>
            <Switch
              value={formData.available}
              onValueChange={(value) => setFormData({ ...formData, available: value })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Amenities (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={formData.amenities}
              onChangeText={value => setFormData({ ...formData, amenities: value })}
              placeholder="e.g. WiFi, Parking, Pool"
            />
          </View>

          {type === 'room' ? renderRoomFields() : renderVehicleFields()}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Images</Text>
            <Text style={styles.cropInfoText}>
              💡 Tip: Choose "Use Original" to avoid cropping, or "Square Crop" for consistent listing images
            </Text>
            <View style={styles.imageContainer}>
              {existingImages.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image 
                    source={{ uri: uri.startsWith('http') ? uri : `http://192.168.141.31:3000/${uri}` }} 
                    style={styles.image} 
                  />
                  <TouchableOpacity 
                    style={styles.deleteImageButton}
                    onPress={() => handleDeleteExistingImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.map((uri, index) => (
                <View key={`new-${index}`} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.deleteImageButton}
                    onPress={() => handleDeleteNewImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity 
                style={styles.addImageButton}
                onPress={handleImagePick}
              >
                <Ionicons name="add" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Listing</Text>
            )}
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  mapContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  locationButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  cropInfoText: {
    marginBottom: 8,
    color: '#666',
  },
});

export default EditListingScreen;
 