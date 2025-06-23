import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card, Chip, Button, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserBookings, cancelBooking } from '../../utils/api';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';

const UserBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      Alert.alert('Error', 'Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking._id });
  };

  const handleCancelBooking = async (booking) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(booking._id);
              Alert.alert('Success', 'Booking cancelled successfully');
              fetchBookings(); // Refresh the list
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', `Failed to cancel booking: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }) => (
    <Card style={styles.bookingCard} onPress={() => handleBookingPress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.listingTitle} numberOfLines={1}>
              {item.listingTitle}
            </Text>
            <Text style={styles.bookingType}>
              {item.bookingType === 'room' ? '🏠 Room' : '🚗 Vehicle'}
            </Text>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>

        {item.listingImage && (
          <Image source={{ uri: item.listingImage }} style={styles.listingImage} />
        )}

        <View style={styles.bookingInfo}>
          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={16} color="#666" />
            <Text style={styles.infoText}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="attach-money" size={16} color="#666" />
            <Text style={styles.infoText}>
              Total: {formatCurrency(item.totalAmount)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={16} color="#666" />
            <Text style={styles.infoText}>
              Owner: {item.ownerName}
            </Text>
          </View>

          {item.numberOfGuests && (
            <View style={styles.infoRow}>
              <MaterialIcons name="group" size={16} color="#666" />
              <Text style={styles.infoText}>
                Guests: {item.numberOfGuests}
              </Text>
            </View>
          )}

          {item.specialRequests && (
            <View style={styles.infoRow}>
              <MaterialIcons name="note" size={16} color="#666" />
              <Text style={styles.infoText} numberOfLines={2}>
                Requests: {item.specialRequests}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleBookingPress(item)}
            style={styles.actionButton}
          >
            View Details
          </Button>
          {(item.status === 'pending' || item.status === 'confirmed') && (
            <Button
              mode="outlined"
              onPress={() => handleCancelBooking(item)}
              style={[styles.actionButton, { borderColor: '#F44336' }]}
              textColor="#F44336"
            >
              Cancel
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="event-busy" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
      <Text style={styles.emptySubtitle}>
        You haven't made any bookings yet. Start exploring rooms and vehicles!
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Home')}
        style={styles.exploreButton}
      >
        Explore Listings
      </Button>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Home')}
        label="New Booking"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  bookingCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookingType: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  listingImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookingInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    borderColor: '#007AFF',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
});

export default UserBookingsScreen; 