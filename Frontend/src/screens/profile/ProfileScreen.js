import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBar from '../../components/StatusBar';

const { width } = Dimensions.get('window');

const ListingCard = ({ image, title, type, price, status, onPress }) => (
  <TouchableOpacity style={styles.listingCard} onPress={onPress}>
    {/* <Image source={image} style={styles.listingImage} /> */}
    <View style={styles.listingContent}>
      <Text style={styles.listingTitle}>{title}</Text>
      <View style={styles.listingDetails}>
        <View style={styles.listingType}>
          <Ionicons 
            name={type === 'room' ? 'bed' : type === 'tour' ? 'map' : 'car'} 
            size={16} 
            color="#007AFF" 
          />
          <Text style={styles.typeText}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </View>
        <Text style={styles.listingPrice}>${price}/day</Text>
      </View>
      <View style={[
        styles.statusBadge,
        { backgroundColor: status === 'active' ? '#E8F5E9' : '#FFEBEE' }
      ]}>
        <Text style={[
          styles.statusText,
          { color: status === 'active' ? '#2E7D32' : '#C62828' }
        ]}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const userListings = [
    {
      id: '1',
      // image: require('../../assets/room1.jpg'),
      title: 'Luxury Sea View Room',
      type: 'room',
      price: '150',
      status: 'active'
    },
    {
      id: '2',
      // image: require('../../assets/vehicle1.jpg'),
      title: 'Toyota Innova',
      type: 'vehicle',
      price: '50',
      status: 'active'
    },
    {
      id: '3',
      // image: require('../../assets/tour1.jpg'),
      title: 'Historical Tour',
      type: 'tour',
      price: '99',
      status: 'inactive'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          {/* <Image 
            source={require('../../assets/profile.jpg')} 
            style={styles.profilePic}
          /> */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john@example.com</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>48</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Listings */}
      <View style={styles.listingsHeader}>
        <Text style={styles.listingsTitle}>My Listings</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listingsContainer}>
          {userListings.map(listing => (
            <ListingCard
              key={listing.id}
              {...listing}
              onPress={() => {
                const screenName = listing.type === 'room' ? 'RoomDetails' :
                                 listing.type === 'vehicle' ? 'VehicleDetails' : 'TourDetails';
                navigation.navigate(screenName, { [listing.type]: listing });
              }}
            />
          ))}
        </View>
      </ScrollView>

      {/* Add Listing Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddListing')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Listing</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#666',
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
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
  seeAllText: {
    color: '#007AFF',
  },
  listingsContainer: {
    padding: 20,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  listingImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  listingContent: {
    flex: 1,
    padding: 15,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 5,
    color: '#007AFF',
  },
  listingPrice: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 