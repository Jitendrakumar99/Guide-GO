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
  Switch,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatusBar from '../../components/StatusBar';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../utils/api';
import { createRoom, createVehicle } from '../../utils/api';
import MapComponent from '../../components/MapComponent';

const AddListingScreen = ({ navigation }) => {
  const [listingType, setListingType] = useState('room'); // 'room' or 'vehicle'
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  // Common fields for both room and vehicle
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    location: {
      type: 'Point',
      coordinates: ['', ''], // [longitude, latitude] as strings for input
    },
    images: [],
    amenities: '', // comma-separated string for input
    status: 'draft',
    available: true,
  });

  // Room specific fields
  const [roomData, setRoomData] = useState({
    type: '',
    rating: '',
    capacity: '',
    pricePerNight: '',
  });

  // Vehicle specific fields
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

  const [coordinates, setCoordinates] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [coordinates.longitude.toString(), coordinates.latitude.toString()],
      },
    }));
  }, [coordinates]);

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

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
        const newImage = result.assets[0].uri;
        setImages([...images, newImage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (const image of images) {
      try {
        const url = await uploadImage(image);
        uploadedUrls.push(url);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload images');
      }
    }
    return uploadedUrls;
  };

  const createListing = async (type, data) => {
    try {
      if (type === 'room') {
        return await createRoom(data);
      } else {
        return await createVehicle(data);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error(error.message || 'Failed to create listing');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate common required fields
      if (!formData.title || !formData.description || !formData.address) {
        Alert.alert('Error', 'Please fill in all required fields (title, description, address)');
        return;
      }

      // Validate type-specific required fields
      if (listingType === 'room') {
        if (!roomData.type || !roomData.pricePerNight) {
          Alert.alert('Error', 'Please fill in all required room fields (type, price per night)');
          return;
        }
      } else {
        if (!vehicleData.vehicleType || !vehicleData.fuelType || !vehicleData.transmission || !vehicleData.pricePerDay) {
          Alert.alert('Error', 'Please fill in all required vehicle fields (type, fuel type, transmission, price per day)');
          return;
        }
      }

      // Validate images
      if (images.length === 0) {
        Alert.alert('Error', 'Please add at least one image');
        return;
      }

      // Validate coordinates
      const lon = parseFloat(formData.location.coordinates[0]);
      const lat = parseFloat(formData.location.coordinates[1]);
      if (isNaN(lon) || isNaN(lat)) {
        Alert.alert('Error', 'Please enter valid coordinates');
        return;
      }

      // Upload images with better error handling
      let imageUrls = [];
      try {
        imageUrls = await uploadImages();
        if (imageUrls.length === 0) {
          throw new Error('No images were uploaded successfully');
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        Alert.alert('Error', 'Failed to upload images. Please try again.');
        return;
      }

      // Prepare amenities array
      const amenitiesArr = formData.amenities
        ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : [];

      // Prepare the final data object without the redundant price field
      let listingData = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        location: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        images: imageUrls,
        amenities: amenitiesArr,
        status: formData.status,
        available: formData.available,
      };

      // Add type-specific data
      if (listingType === 'room') {
        listingData = {
          ...listingData,
          type: roomData.type,
          rating: roomData.rating ? parseFloat(roomData.rating) : 0,
          capacity: roomData.capacity ? parseInt(roomData.capacity) : 1,
          pricePerNight: parseFloat(roomData.pricePerNight),
        };
      } else {
        listingData = {
          ...listingData,
          vehicleType: vehicleData.vehicleType,
          brand: vehicleData.brand || '',
          model: vehicleData.model || '',
          registrationNumber: vehicleData.registrationNumber || '',
          fuelType: vehicleData.fuelType,
          transmission: vehicleData.transmission,
          rating: vehicleData.rating ? parseFloat(vehicleData.rating) : 0,
          capacity: vehicleData.capacity ? parseInt(vehicleData.capacity) : 1,
          pricePerDay: parseFloat(vehicleData.pricePerDay),
        };
      }

      // Create the listing
      const response = await createListing(listingType, listingData);
      console.log('Listing created successfully:', response);

      Alert.alert('Success', 'Listing created successfully', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back and refresh the profile screen
            navigation.navigate('Profile', { refresh: true });
          }
        }
      ]);
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', error.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Listing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Listing Type</Text>
            <Picker
              selectedValue={listingType}
              onValueChange={(value) => setListingType(value)}
              style={styles.picker}
            >
              <Picker.Item label="Room" value="room" />
              <Picker.Item label="Vehicle" value="vehicle" />
            </Picker>
          </View>

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
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(value) => setFormData({ ...formData, price: value })}
              keyboardType="numeric"
              placeholder={`Enter price per ${listingType === 'room' ? 'night' : 'day'}`}
            />
          </View>

          {listingType === 'room' ? renderRoomFields() : renderVehicleFields()}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Images *</Text>
            <Text style={styles.subLabel}>Add at least one image for your listing</Text>
            <Text style={styles.cropInfoText}>
              💡 Tip: Choose "Use Original" to avoid cropping, or "Square Crop" for consistent listing images
            </Text>
            <View style={styles.imageContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.deleteImageButton}
                    onPress={() => {
                      Alert.alert(
                        'Delete Image',
                        'Are you sure you want to delete this image?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => setImages(images.filter((_, i) => i !== index))
                          }
                        ]
                      );
                    }}
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
                <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
            </View>
            {images.length > 0 && (
              <Text style={styles.imageCountText}>
                {images.length} image{images.length !== 1 ? 's' : ''} selected
              </Text>
            )}
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

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Select Location</Text>
            <MapComponent
              initialRegion={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              markers={[
                {
                  coordinate: coordinates,
                  title: 'Selected Location',
                },
              ]}
              onMapPress={e => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setCoordinates({ latitude, longitude });
              }}
              style={{ height: 250, marginBottom: 10 }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12 }}>Latitude</Text>
              <TextInput
                  style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 5 }}
                  value={coordinates.latitude.toString()}
                  onChangeText={val => setCoordinates(c => ({ ...c, latitude: parseFloat(val) || 0 }))}
                keyboardType="numeric"
              />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12 }}>Longitude</Text>
              <TextInput
                  style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 5 }}
                  value={coordinates.longitude.toString()}
                  onChangeText={val => setCoordinates(c => ({ ...c, longitude: parseFloat(val) || 0 }))}
                keyboardType="numeric"
              />
              </View>
            </View>
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

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Create Listing'}
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        height: 150,
      },
    }),
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
  addImageText: {
    color: '#007AFF',
    marginLeft: 8,
    fontSize: 16,
  },
  imageCountText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subLabel: {
    color: '#666',
    fontSize: 14,
  },
  cropInfoText: {
    color: '#666',
    fontSize: 14,
  },
});

export default AddListingScreen;
 