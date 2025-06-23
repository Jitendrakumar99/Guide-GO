import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBar from '../../components/StatusBar';
import { getAllRooms } from '../../utils/api';

const { width } = Dimensions.get('window');
const defaultImage = require('../../../assets/photo/pac1.jpg');
const backend_url="http://192.168.141.31:3000";
const RoomCard = ({ room, onPress }) => {
  // Format location coordinates to a readable string
  const locationString = room.location?.coordinates ? 
    `${room.location.coordinates[1]}, ${room.location.coordinates[0]}` : 
    'Location not specified';

  return (
    <TouchableOpacity style={styles.roomCard} onPress={onPress}>
      <Image 
        source={room.images?.[0] ? { uri: `${backend_url}/${room.images[0]}` } : defaultImage} 
        style={styles.roomImage} 
        resizeMode="cover" 
      />
      <View style={styles.roomContent}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomTitle}>{room.title || 'Untitled Room'}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{room.rating || '0.0'}</Text>
          </View>
        </View>
        <View style={styles.typeContainer}>
          <Ionicons name="bed" size={16} color="#007AFF" />
          <Text style={styles.typeText}>{room.type || 'Standard'}</Text>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#007AFF" />
          <Text style={styles.locationText}>{room.address || locationString}</Text>
        </View>
        <View style={styles.ownerContainer}>
          <Ionicons name="person" size={16} color="#007AFF" />
          <Text style={styles.ownerText}>{room.owner?.name || 'Unknown Owner'}</Text>
        </View>
        <Text style={styles.priceText}>₹{room.price }/night</Text>
      </View>
    </TouchableOpacity>
  );
};

const RoomScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);

  const filters = ['All', 'Standard', 'Deluxe', 'Suite'];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomsData = await getAllRooms();
      setRooms(roomsData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || room.type?.toLowerCase() === selectedFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading rooms...</Text>
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
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchRooms}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Rooms</Text>
        <Text style={styles.headerSubtitle}>Find your perfect stay</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search rooms by name or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterTab,
                selectedFilter === filter.toLowerCase() && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(filter.toLowerCase())}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.toLowerCase() && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Rooms List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.roomsContainer}>
          {filteredRooms.length > 0 ? (
            filteredRooms.map(room => (
              <RoomCard
                key={room._id || room.id}
                room={room}
                onPress={() => navigation.navigate('RoomDetails', { room })}
              />
            ))
          ) : (
            <View style={styles.noRoomsContainer}>
              <Ionicons name="bed-outline" size={48} color="#ccc" />
              <Text style={styles.noRoomsText}>No rooms found</Text>
              <Text style={styles.noRoomsSubtext}>
                {searchQuery || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No rooms available at the moment'}
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
    paddingTop: 0,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 10,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  roomsContainer: {
    padding: 15,
  },
  roomCard: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  roomImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  roomContent: {
    padding: 15,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    color: '#FFB800',
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
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
  noRoomsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noRoomsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  noRoomsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ownerText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});

export default RoomScreen; 