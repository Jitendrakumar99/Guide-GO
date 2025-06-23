import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingCard = ({ booking, onPress, isOwner }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA000'; // Orange
      case 'confirmed':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#F44336'; // Red
      case 'completed':
        return '#2196F3'; // Blue
      default:
        return '#666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image 
          source={
            booking.listingImage 
              ? { uri: booking.listingImage }
              : require('../../../assets/photo/pac1.jpg')
          }
          style={styles.image}
          resizeMode="cover"
        />
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{booking.listingTitle}</Text>
        
        <View style={styles.datesContainer}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.dateText}>
              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color="#666" />
            <Text style={styles.detailText}>{formatPrice(booking.totalAmount)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card" size={16} color="#666" />
            <Text style={styles.detailText}>
              {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>

        {isOwner ? (
          <View style={styles.userInfo}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.userText}>
              Booked by: {booking.bookerName}
            </Text>
          </View>
        ) : (
          <View style={styles.userInfo}>
            <Ionicons name="business" size={16} color="#666" />
            <Text style={styles.userText}>
              Owner: {booking.ownerName}
            </Text>
          </View>
        )}

        {booking.specialRequests && (
          <View style={styles.requestsContainer}>
            <Ionicons name="chatbubble" size={16} color="#666" />
            <Text style={styles.requestsText} numberOfLines={2}>
              {booking.specialRequests}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  datesContainer: {
    marginBottom: 10,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  requestsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  requestsText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
});

export default BookingCard; 