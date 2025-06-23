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
import { getUserById, updateUser } from '../../utils/api';

const EditProfile = ({ navigation, route }) => {
  const { onProfileUpdate } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: null,
    profilePic: null,
    address: '',
  });
  const [image, setImage] = useState(null);

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
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location?.coordinates ? 
                `${formData.location.coordinates[0]}, ${formData.location.coordinates[1]}` : 
                ''}
              onChangeText={(value) => {
                // Simple coordinate parsing - you might want to use a proper location picker
                const [lat, lng] = value.split(',').map(coord => parseFloat(coord.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                  handleChange('location', {
                    type: 'Point',
                    coordinates: [lat, lng]
                  });
                }
              }}
              placeholder="Enter coordinates (latitude, longitude)"
              editable={!loading}
            />
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
});

export default EditProfile;