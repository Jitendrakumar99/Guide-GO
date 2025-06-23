import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getBookingById, updateBookingStatus, cancelBooking, getCurrentUser } from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
    fetchCurrentUser();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const bookingData = await getBookingById(bookingId);
      setBooking(bookingData);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const isOwner = () => {
    // Debug logging
    console.log('Current user:', currentUser?._id);
    console.log('Booking owner:', booking?.owner?._id || booking?.owner);
    console.log('Is owner check:', currentUser && booking && currentUser._id === (booking.owner?._id || booking.owner));
    
    return currentUser && booking && currentUser._id === (booking.owner?._id || booking.owner);
  };

  const isBooker = () => {
    // Debug logging
    console.log('Current user:', currentUser?._id);
    console.log('Booking booker:', booking?.booker?._id || booking?.booker);
    console.log('Is booker check:', currentUser && booking && currentUser._id === (booking.booker?._id || booking.booker));
    
    return currentUser && booking && currentUser._id === (booking.booker?._id || booking.booker);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateBookingStatus(bookingId, newStatus);
      Alert.alert('Success', `Booking status updated to ${newStatus}`);
      fetchBookingDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating booking status:', error);
      Alert.alert('Error', 'Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelBooking = async () => {
    // Debug logging
    console.log('Cancel booking called for booking ID:', bookingId);
    console.log('Current user role - isOwner:', isOwner(), 'isBooker:', isBooker());
    
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
              console.log('Starting cancellation process...');
              setUpdating(true);
              const result = await cancelBooking(bookingId);
              console.log('Cancellation result:', result);
              Alert.alert('Success', 'Booking cancelled successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error cancelling booking:', error);
              console.error('Error details:', error.message, error.stack);
              Alert.alert('Error', `Failed to cancel booking: ${error.message}`);
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#757575';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'paid': return '#4CAF50';
      case 'refunded': return '#F44336';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={64} color="#F44336" />
        <Text style={styles.errorText}>Booking not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.title}>{booking.listingTitle}</Text>
              <Chip
                mode="outlined"
                textStyle={{ color: getStatusColor(booking.status) }}
                style={[styles.statusChip, { borderColor: getStatusColor(booking.status) }]}
              >
                {booking.status.toUpperCase()}
              </Chip>
            </View>

            {booking.listingImage && (
              <Image source={{ uri: booking.listingImage }} style={styles.image} />
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Information</Text>
              <View style={styles.infoRow}>
                <MaterialIcons name="event" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="attach-money" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Total Amount: {formatCurrency(booking.totalAmount)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="payment" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Payment Method: {booking.paymentMethod.toUpperCase()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Chip
                  mode="outlined"
                  textStyle={{ color: getPaymentStatusColor(booking.paymentStatus) }}
                  style={[styles.paymentChip, { borderColor: getPaymentStatusColor(booking.paymentStatus) }]}
                >
                  {booking.paymentStatus.toUpperCase()}
                </Chip>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Show different information based on user role */}
            {isOwner() ? (
              // Owner view - show guest information
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Guest Information</Text>
                <View style={styles.infoRow}>
                  <MaterialIcons name="person" size={20} color="#666" />
                  <Text style={styles.infoText}>Name: {booking.bookerName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="email" size={20} color="#666" />
                  <Text style={styles.infoText}>Email: {booking.bookerEmail}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={20} color="#666" />
                  <Text style={styles.infoText}>Phone: {booking.bookerPhone}</Text>
                </View>
                {booking.numberOfGuests && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="group" size={20} color="#666" />
                    <Text style={styles.infoText}>Guests: {booking.numberOfGuests}</Text>
                  </View>
                )}
              </View>
            ) : (
              // Booker view - show owner information
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Owner Information</Text>
                <View style={styles.infoRow}>
                  <MaterialIcons name="person" size={20} color="#666" />
                  <Text style={styles.infoText}>Name: {booking.ownerName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="email" size={20} color="#666" />
                  <Text style={styles.infoText}>Email: {booking.ownerEmail}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={20} color="#666" />
                  <Text style={styles.infoText}>Phone: {booking.ownerPhone}</Text>
                </View>
              </View>
            )}

            {booking.specialRequests && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Special Requests</Text>
                  <Text style={styles.specialRequests}>{booking.specialRequests}</Text>
                </View>
              </>
            )}

            {booking.pickupLocation && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Vehicle Details</Text>
                  <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={20} color="#666" />
                    <Text style={styles.infoText}>Pickup: {booking.pickupLocation}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialIcons name="location-off" size={20} color="#666" />
                    <Text style={styles.infoText}>Dropoff: {booking.dropoffLocation}</Text>
                  </View>
                </View>
              </>
            )}

            <Divider style={styles.divider} />

            {/* Show different actions based on user role */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              
              {isOwner() ? (
                // Owner actions
                <>
                  {booking.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <Button
                        mode="contained"
                        onPress={() => handleStatusUpdate('confirmed')}
                        loading={updating}
                        disabled={updating}
                        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                      >
                        Confirm Booking
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleStatusUpdate('cancelled')}
                        loading={updating}
                        disabled={updating}
                        style={[styles.actionButton, { borderColor: '#F44336' }]}
                        textColor="#F44336"
                      >
                        Reject Booking
                      </Button>
                    </View>
                  )}

                  {booking.status === 'confirmed' && (
                    <View style={styles.actionButtons}>
                      <Button
                        mode="contained"
                        onPress={() => handleStatusUpdate('completed')}
                        loading={updating}
                        disabled={updating}
                        style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                      >
                        Mark as Completed
                      </Button>
                    </View>
                  )}

                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button
                      mode="outlined"
                      onPress={handleCancelBooking}
                      loading={updating}
                      disabled={updating}
                      style={[styles.actionButton, { borderColor: '#F44336' }]}
                      textColor="#F44336"
                    >
                      Cancel Booking
                    </Button>
                  )}
                </>
              ) : (
                // Booker actions
                <>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button
                      mode="outlined"
                      onPress={handleCancelBooking}
                      loading={updating}
                      disabled={updating}
                      style={[styles.actionButton, { borderColor: '#F44336' }]}
                      textColor="#F44336"
                    >
                      Cancel My Booking
                    </Button>
                  )}
                </>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
    flex: 1,
  },
  paymentChip: {
    alignSelf: 'flex-start',
  },
  specialRequests: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default BookingDetailsScreen; 