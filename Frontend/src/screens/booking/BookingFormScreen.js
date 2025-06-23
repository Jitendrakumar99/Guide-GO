import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { createBooking, getCurrentUser } from '../../utils/api';

const BookingFormScreen = ({ route, navigation }) => {
  const { listing, listingType } = route.params;
  console.log(listing);
  console.log(listingType);
  
  
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [formData, setFormData] = useState({
    numberOfGuests: '1',
    pickupLocation: '',
    dropoffLocation: '',
    specialRequests: '',
    paymentMethod: 'cash',
  });

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

  const calculateTotalPrice = () => {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const pricePerUnit = listingType === 'room' 
      ? (listing.pricePerNight || listing.price || 0)
      : (listing.pricePerDay || 0);
    return days * pricePerUnit;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Get current user data
      const userData = await getCurrentUser();
      if (!userData) {
        throw new Error('Please login to make a booking');
      }

      // Validate user data
      if (!userData.name || !userData.email || !userData.phone) {
        throw new Error('Please complete your profile information (name, email, phone) before booking');
      }

      // Validate required fields based on booking type
      if (listingType === 'room') {
        if (!formData.numberOfGuests) {
          throw new Error('Please enter number of guests');
        }
      } else {
        if (!formData.pickupLocation || !formData.dropoffLocation) {
          throw new Error('Please provide pickup and dropoff locations');
        }
      }

      // Validate listing data
      if (!listing._id && !listing.id) {
        throw new Error('Invalid listing data: Missing listing ID');
      }

      // Validate owner data
      if (!listing.owner || (!listing.owner._id && !listing.owner.id)) {
        throw new Error('Invalid owner data: Missing owner ID');
      }

      const bookingData = {
        bookingType: listingType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalAmount: calculateTotalPrice(),
        paymentMethod: formData.paymentMethod || 'cash',
        
        // Booker details (all required)
        booker: userData._id,
        bookerName: userData.name,
        bookerEmail: userData.email,
        bookerPhone: userData.phone,
        bookerAddress: userData.address || '',
        
        // Listing details (all required)
        listing: listing._id || listing.id,
        listingModel: listingType === 'room' ? 'Room' : 'Vehicle',
        listingTitle: listing.title,
        listingPrice: listingType === 'room' ? (listing.pricePerNight || listing.price) : listing.pricePerDay,
        
        // Owner details
        owner: listing.owner._id || listing.owner.id,
        ownerName: listing.owner.name,
        ownerEmail: listing.owner.email || '',
        ownerPhone: listing.owner.phone || '',
        
        // Type-specific details
        numberOfGuests: listingType === 'room' ? parseInt(formData.numberOfGuests) : undefined,
        pickupLocation: listingType === 'vehicle' ? formData.pickupLocation : undefined,
        dropoffLocation: listingType === 'vehicle' ? formData.dropoffLocation : undefined,
        specialRequests: formData.specialRequests || ''
      };

      // Log booking data for debugging
      console.log('Submitting booking data:', bookingData);

      const response = await createBooking(bookingData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.missingFields) {
        throw new Error(`Missing required fields: ${response.missingFields.join(', ')}`);
      }

      Alert.alert('Success', 'Booking created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Profile', { refresh: true }) }
      ]);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.message || 'Failed to create booking');
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
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book {listingType === 'room' ? 'Room' : 'Vehicle'}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Date Selection */}
          <View style={styles.dateContainer}>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => {
                setDatePickerMode('start');
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateLabel}>
                {listingType === 'room' ? 'Check-in' : 'Pickup'} Date
              </Text>
              <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => {
                setDatePickerMode('end');
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateLabel}>
                {listingType === 'room' ? 'Check-out' : 'Dropoff'} Date
              </Text>
              <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* Type-specific fields */}
          {listingType === 'room' ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Number of Guests</Text>
              <TextInput
                style={styles.input}
                value={formData.numberOfGuests}
                onChangeText={(value) => setFormData({ ...formData, numberOfGuests: value })}
                keyboardType="numeric"
                placeholder="Enter number of guests"
              />
            </View>
          ) : (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Pickup Location</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pickupLocation}
                  onChangeText={(value) => setFormData({ ...formData, pickupLocation: value })}
                  placeholder="Enter pickup location"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Dropoff Location</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dropoffLocation}
                  onChangeText={(value) => setFormData({ ...formData, dropoffLocation: value })}
                  placeholder="Enter dropoff location"
                />
              </View>
            </>
          )}

          {/* Common fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Method</Text>
            <Picker
              selectedValue={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              style={styles.picker}
            >
              <Picker.Item label="Cash" value="cash" />
              <Picker.Item label="Card" value="card" />
              <Picker.Item label="UPI" value="upi" />
            </Picker>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Special Requests</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.specialRequests}
              onChangeText={(value) => setFormData({ ...formData, specialRequests: value })}
              placeholder="Any special requests or requirements"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Price Summary */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.price}>₹{calculateTotalPrice()}</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    backgroundColor: '#fff',
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
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
  priceContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingFormScreen; 