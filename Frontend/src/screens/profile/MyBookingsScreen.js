import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBar from '../../components/StatusBar';
import { getUserBookings, getAllBookings } from '../../utils/api';
import BookingCard from '../booking/BookingCard';

const MyBookingsScreen = ({ navigation }) => {
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const bookings = await getUserBookings();
      setMyBookings(bookings);
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking._id });
  };

  const handleTestBookings = async () => {
    try {
      setBookingsLoading(true);
      const allBookings = await getAllBookings();
      Alert.alert('Test Results', `Found ${allBookings.length} bookings in database.`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch all bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  if (bookingsLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.listingsHeader}>
        <Text style={styles.listingsTitle}>My Bookings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={fetchBookings} style={styles.navButton}>
            <Text style={styles.navButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTestBookings}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listingsContainer}>
          {myBookings && myBookings.length > 0 ? (
            myBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onPress={() => handleBookingPress(booking)}
                isOwner={false}
              />
            ))
          ) : (
            <View style={styles.noListingsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.noListingsText}>No bookings yet</Text>
              <Text style={styles.noListingsSubtext}>
                Your booking history will appear here
              </Text>
              <TouchableOpacity onPress={fetchBookings} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    color: '#007AFF',
    fontSize: 12,
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 12,
    padding: 5,
  },
  listingsContainer: {
    padding: 20,
  },
  noListingsContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  noListingsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  noListingsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  primaryButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyBookingsScreen; 