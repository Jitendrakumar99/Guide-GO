import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBar from '../../components/StatusBar';
import { getUserById, deleteRoom, deleteVehicle, toggleListingStatus } from '../../utils/api';
import ListingCard from './ListingCard';

const MyListingsScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserById();
      setUserData(response);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleListingPress = (item, type) => {
    if (type === 'room') {
      navigation.navigate('Rooms', { screen: 'RoomDetails', params: { room: item } });
    } else if (type === 'vehicle') {
      navigation.navigate('Vehicles', { screen: 'VehicleDetails', params: { vehicle: item } });
    }
  };

  const handleEditListing = (id, type) => {
    navigation.navigate('EditListing', { id, type });
  };

  const handleDeleteListing = async (id, type) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'room') {
                await deleteRoom(id);
              } else {
                await deleteVehicle(id);
              }
              await fetchUserData();
              Alert.alert('Success', 'Listing deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (id, type, newStatus) => {
    try {
      await toggleListingStatus(type, id, newStatus);
      await fetchUserData();
      Alert.alert('Success', `Listing ${newStatus === 'published' ? 'published' : 'drafted'} successfully`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update listing status');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.listingsHeader}>
        <Text style={styles.listingsTitle}>My Listings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddListing')}>
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listingsContainer}>
          {/* Rooms */}
          {Array.isArray(userData?.rooms) && userData.rooms.map(room => (
            <ListingCard
              key={room._id || Math.random().toString()}
              id={room._id}
              title={room.title || 'Room Listing'}
              type="room"
              price={room.pricePerNight || 0}
              status={room.status || 'draft'}
              onPress={() => handleListingPress(room, 'room')}
              onEdit={id => handleEditListing(id, 'room')}
              onDelete={id => handleDeleteListing(id, 'room')}
              onToggleStatus={(id, newStatus) => handleToggleStatus(id, 'room', newStatus)}
            />
          ))}
          {/* Vehicles */}
          {Array.isArray(userData?.vehicles) && userData.vehicles.map(vehicle => (
            <ListingCard
              key={vehicle._id || Math.random().toString()}
              id={vehicle._id}
              title={vehicle.title || 'Vehicle Listing'}
              type="vehicle"
              price={vehicle.pricePerDay || 0}
              status={vehicle.status || 'draft'}
              onPress={() => handleListingPress(vehicle, 'vehicle')}
              onEdit={id => handleEditListing(id, 'vehicle')}
              onDelete={id => handleDeleteListing(id, 'vehicle')}
              onToggleStatus={(id, newStatus) => handleToggleStatus(id, 'vehicle', newStatus)}
            />
          ))}
          {(!Array.isArray(userData?.rooms) || !userData.rooms.length) &&
            (!Array.isArray(userData?.vehicles) || !userData.vehicles.length) && (
              <View style={styles.noListingsContainer}>
                <Ionicons name="add-circle-outline" size={48} color="#ccc" />
                <Text style={styles.noListingsText}>No listings yet</Text>
                <Text style={styles.noListingsSubtext}>
                  Add your first room or vehicle listing to get started
                </Text>
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

export default MyListingsScreen; 