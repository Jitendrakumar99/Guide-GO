import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBar from '../../components/StatusBar';
import { getUserById, getUserEarnings } from '../../utils/api';
import { getAuthToken } from '../../utils/api';
import { updateRoom, updateVehicle, deleteRoom, deleteVehicle, toggleListingStatus } from '../../utils/api';
import BookingCard from '../booking/BookingCard';
import { getUserBookings, getOwnerBookings, getAllBookings } from '../../utils/api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const getAddress = async (lat, lon) => {
  try {
    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      console.log('Invalid coordinates:', { lat, lon });
      return 'Invalid location';
    }

    // Check if coordinates are within valid ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.log('Coordinates out of range:', { latitude, longitude });
      return 'Invalid location';
    }

    // Add a small delay to respect Nominatim's rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Fetching address for coordinates:', { latitude, longitude });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0',
          'Accept-Language': 'en' // Request English results
        }
      }
    );

    if (!res.ok) {
      console.log('Nominatim API error:', res.status, res.statusText);
      return 'Location unavailable';
    }

    const data = await res.json();
    console.log('Nominatim response:', data);
    
    // Check if we have a valid response with display_name
    if (!data || !data.display_name) {
      if (data.error) {
        console.log('Nominatim error:', data.error);
        return 'Location unavailable';
      }
      console.log('Invalid response from Nominatim:', data);
      return 'Location unavailable';
    }

    // Try to extract a more meaningful address
    const addressParts = data.display_name.split(',');
    if (!addressParts || addressParts.length === 0) {
      return 'Location unavailable';
    }

    // Extract meaningful parts of the address
    let meaningfulParts = [];
    
    // Look for city, town, or village
    if (data.address) {
      if (data.address.city) {
        meaningfulParts.push(data.address.city);
      } else if (data.address.town) {
        meaningfulParts.push(data.address.town);
      } else if (data.address.village) {
        meaningfulParts.push(data.address.village);
      }
      
      // Add state/province if available
      if (data.address.state) {
        meaningfulParts.push(data.address.state);
      }
      
      // Add country if available
      if (data.address.country) {
        meaningfulParts.push(data.address.country);
      }
    }

    // If we couldn't extract meaningful parts from address object, use display_name
    if (meaningfulParts.length === 0) {
      // Take first 3 meaningful parts from display_name
      for (let i = 0; i < Math.min(3, addressParts.length); i++) {
        const part = addressParts[i]?.trim();
        if (part && !part.match(/^\d+$/) && part.length > 2) { // Skip if it's just a number or too short
          meaningfulParts.push(part);
        }
      }
    }

    return meaningfulParts.length > 0 ? meaningfulParts.join(', ') : 'Location unavailable';
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Location unavailable';
  }
};

const ListingCard = ({ title, type, price, status, onPress, onEdit, onDelete, onToggleStatus, id }) => (
  <TouchableOpacity style={styles.listingCard} onPress={onPress}>
    <View style={styles.listingContent}>
      <Text style={styles.listingTitle}>{title}</Text>
      <View style={styles.listingDetails}>
        <View style={styles.listingType}>
          <Ionicons 
            name={type === 'room' ? 'bed' : 'car'} 
            size={16} 
            color="#007AFF" 
          />
          <Text style={styles.typeText}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </View>
        <Text style={styles.listingPrice}>${price}/day</Text>
      </View>
      <View style={styles.listingActions}>
      <View style={[
        styles.statusBadge,
          { backgroundColor: status === 'published' ? '#E8F5E9' : '#FFEBEE' }
      ]}>
        <Text style={[
          styles.statusText,
            { color: status === 'published' ? '#2E7D32' : '#C62828' }
        ]}>
            {status === 'published' ? 'Published' : 'Draft'}
        </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => onEdit(id)}
          >
            <Ionicons name="pencil" size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.toggleButton]} 
            onPress={() => onToggleStatus(id, status === 'published' ? 'draft' : 'published')}
          >
            <Ionicons 
              name={status === 'published' ? 'eye-off' : 'eye'} 
              size={16} 
              color={status === 'published' ? '#C62828' : '#2E7D32'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => onDelete(id)}
          >
            <Ionicons name="trash" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation, route }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');
  const [myBookings, setMyBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(false);

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        await fetchUserData();
      } catch (err) {
        console.error('Error initializing profile:', err);
      }
    };
    
    initializeProfile();
  }, []);

  // Add effect to handle refresh parameter
  useEffect(() => {
    if (route.params?.refresh) {
      fetchUserData();
      // Clear the refresh parameter
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  useEffect(() => {
    const fetchLocationName = async () => {
      if (userData?.location?.coordinates) {
        setLocationLoading(true);
        try {
          const [longitude, latitude] = userData.location.coordinates; // GeoJSON format: [lng, lat]
          const address = await getAddress(latitude, longitude);
          setLocationName(address);
        } catch (error) {
          console.error('Error fetching location name:', error);
          setLocationName('Location unavailable');
        } finally {
          setLocationLoading(false);
        }
      } else {
        setLocationName('');
        setLocationLoading(false);
      }
    };

    fetchLocationName();
  }, [userData?.location?.coordinates]);

  // Fetch earnings when earnings tab is active
  useEffect(() => {
    if (activeTab === 'earnings' && !earnings) {
      fetchEarnings();
    }
  }, [activeTab]);

  // Add useEffect to fetch bookings when tab changes
  useEffect(() => {
    if (activeTab === 'myBookings' || activeTab === 'userBooked') {
      fetchBookings();
    }
  }, [activeTab]);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Please login to view your profile');
      }

      const response = await getUserById();
      setUserData(response);

    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleProfileUpdate = (updatedUser) => {
    // Transform the updated user data to match our frontend format
    const transformedData = {
      id: updatedUser._id,
      name: updatedUser.name || '',
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      address: updatedUser.address || '',
      profilePic: updatedUser.profilePic || null,
      location: updatedUser.location ? {
        type: updatedUser.location.type,
        coordinates: updatedUser.location.coordinates
      } : null,
      rooms: updatedUser.rooms || [],
      vehicles: updatedUser.vehicles || [],
      createdAt: updatedUser.createdAt,
      stats: {
        totalListings: (updatedUser.rooms?.length || 0) + (updatedUser.vehicles?.length || 0),
        totalRooms: updatedUser.rooms?.length || 0,
        totalVehicles: updatedUser.vehicles?.length || 0
      }
    };
    setUserData(transformedData);
  };

  const handleListingPress = (item, type) => {
    try {
      if (type === 'room') {
        const roomData = {
        _id: item._id || '',
          title: item.title || 'Untitled Room',
        description: item.description || '',
          pricePerNight: item.pricePerNight || 0,
        status: item.status || 'active',
        images: Array.isArray(item.images) ? item.images : [],
        amenities: Array.isArray(item.amenities) ? item.amenities : [],
          roomType: item.roomType || 'standard',
          capacity: item.capacity || 1,
          bedType: item.bedType || 'single',
        location: item.location ? {
          type: item.location.type || 'Point',
          coordinates: Array.isArray(item.location.coordinates) 
            ? item.location.coordinates 
            : [0, 0]
        } : {
          type: 'Point',
          coordinates: [0, 0]
        }
      };
        navigation.navigate('Rooms', {
          screen: 'RoomDetails',
          params: { room: roomData }
        });
      } else if (type === 'vehicle') {
        const vehicleData = {
          _id: item._id || '',
          title: item.title || 'Untitled Vehicle',
          description: item.description || '',
          pricePerDay: item.pricePerDay || 0,
          status: item.status || 'active',
          images: Array.isArray(item.images) ? item.images : [],
          amenities: Array.isArray(item.amenities) ? item.amenities : [],
          vehicleType: item.vehicleType || 'car',
          model: item.model || '',
          year: item.year || '',
          transmission: item.transmission || 'automatic',
          fuelType: item.fuelType || 'petrol',
          location: item.location ? {
            type: item.location.type || 'Point',
            coordinates: Array.isArray(item.location.coordinates) 
              ? item.location.coordinates 
              : [0, 0]
          } : {
            type: 'Point',
            coordinates: [0, 0]
          }
        };
        navigation.navigate('Vehicles', {
          screen: 'VehicleDetails',
          params: { vehicle: vehicleData }
        });
      }
    } catch (error) {
      console.error('Error handling listing press:', error);
      Alert.alert(
        'Error',
        'Unable to open listing details. Please try again.'
      );
    }
  };

  const handleEditListing = (id, type) => {
    // Navigate to edit screen with the listing ID and type
    navigation.navigate('EditListing', { id, type });
  };

  const handleDeleteListing = async (id, type) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
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
              // Refresh the user data to update the listings
              await fetchUserData();
              Alert.alert('Success', 'Listing deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete listing');
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (id, type, newStatus) => {
    try {
      await toggleListingStatus(type, id, newStatus);
      // Refresh the user data to update the listings
      await fetchUserData();
      Alert.alert('Success', `Listing ${newStatus === 'published' ? 'published' : 'drafted'} successfully`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update listing status');
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      if (activeTab === 'myBookings') {
        const bookings = await getUserBookings();
        console.log('My Bookings:', bookings); // Debug log
        setMyBookings(bookings);
      } else if (activeTab === 'userBooked') {
        const bookings = await getOwnerBookings();
        console.log('User Bookings:', bookings); // Debug log
        setUserBookings(bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking._id });
  };

  const handleUserBookings = () => {
    navigation.navigate('UserBookings');
  };

  const handleOwnerBookings = () => {
    navigation.navigate('OwnerBookings');
  };

  const handleTestBookings = async () => {
    try {
      setBookingsLoading(true);
      const allBookings = await getAllBookings();
      console.log('All bookings:', allBookings);
      Alert.alert(
        'Test Results',
        `Found ${allBookings.length} bookings in database.\n\n` +
        'Check console for full details.'
      );
    } catch (error) {
      console.error('Error testing bookings:', error);
      Alert.alert('Error', error.message || 'Failed to fetch all bookings');
    }
  };

  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true);
      const data = await getUserEarnings();
      setEarnings(data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      // Don't show alert for earnings, just log the error
    } finally {
      setEarningsLoading(false);
    }
  };

  const handleEarningsPress = () => {
    navigation.navigate('Earnings');
  };

  // const renderTabContent = () => {
  //   switch (activeTab) {
  //     case 'listings':
  //       return (
  //         <View style={styles.tabContent}>
  //           <View style={styles.listingsHeader}>
  //             <Text style={styles.listingsTitle}>My Listings</Text>
  //             <TouchableOpacity>
  //               <Text style={styles.seeAllText}>See All</Text>
  //             </TouchableOpacity>
  //           </View>
  //           <ScrollView showsVerticalScrollIndicator={false}>
  //             <View style={styles.listingsContainer}>
  //               {/* Rooms */}
  //               {Array.isArray(userData?.rooms) && userData.rooms.map(room => (
  //                 <ListingCard
  //                   key={room._id || Math.random().toString()}
  //                   id={room._id}
  //                   title={room.title || 'Room Listing'}
  //                   type="room"
  //                   price={room.pricePerNight || 0}
  //                   status={room.status || 'draft'}
  //                   onPress={() => handleListingPress(room, 'room')}
  //                   onEdit={(id) => handleEditListing(id, 'room')}
  //                   onDelete={(id) => handleDeleteListing(id, 'room')}
  //                   onToggleStatus={(id, newStatus) => handleToggleStatus(id, 'room', newStatus)}
  //                 />
  //               ))}
                
  //               {/* Vehicles */}
  //               {Array.isArray(userData?.vehicles) && userData.vehicles.map(vehicle => (
  //                 <ListingCard
  //                   key={vehicle._id || Math.random().toString()}
  //                   id={vehicle._id}
  //                   title={vehicle.title || 'Vehicle Listing'}
  //                   type="vehicle"
  //                   price={vehicle.pricePerDay || 0}
  //                   status={vehicle.status || 'draft'}
  //                   onPress={() => handleListingPress(vehicle, 'vehicle')}
  //                   onEdit={(id) => handleEditListing(id, 'vehicle')}
  //                   onDelete={(id) => handleDeleteListing(id, 'vehicle')}
  //                   onToggleStatus={(id, newStatus) => handleToggleStatus(id, 'vehicle', newStatus)}
  //                 />
  //               ))}

  //               {(!Array.isArray(userData?.rooms) || !userData.rooms.length) && 
  //                (!Array.isArray(userData?.vehicles) || !userData.vehicles.length) && (
  //                 <View style={styles.noListingsContainer}>
  //                   <Ionicons name="add-circle-outline" size={48} color="#ccc" />
  //                   <Text style={styles.noListingsText}>No listings yet</Text>
  //                   <Text style={styles.noListingsSubtext}>
  //                     Add your first room or vehicle listing to get started
  //                   </Text>
  //                 </View>
  //               )}
  //             </View>
  //           </ScrollView>
  //         </View>
  //       );

  //     case 'myBookings':
  //       return (
  //         <View style={styles.tabContent}>
  //           <View style={styles.listingsHeader}>
  //             <Text style={styles.listingsTitle}>My Bookings</Text>
  //             <View style={styles.headerActions}>
  //               <TouchableOpacity onPress={handleUserBookings} style={styles.navButton}>
  //                 <Text style={styles.navButtonText}>View All</Text>
  //               </TouchableOpacity>
  //               <TouchableOpacity onPress={handleTestBookings}>
  //                 <Text style={styles.testButtonText}>Test</Text>
  //               </TouchableOpacity>
  //             </View>
  //           </View>
  //           <ScrollView showsVerticalScrollIndicator={false}>
  //             <View style={styles.listingsContainer}>
  //               {bookingsLoading ? (
  //                 <View style={styles.loadingContainer}>
  //                   <ActivityIndicator size="large" color="#007AFF" />
  //                   <Text style={styles.loadingText}>Loading bookings...</Text>
  //                 </View>
  //               ) : myBookings && myBookings.length > 0 ? (
  //                 myBookings.map((booking) => (
  //                   <BookingCard
  //                     key={booking._id}
  //                     booking={booking}
  //                     onPress={() => handleBookingPress(booking)}
  //                     isOwner={false}
  //                   />
  //                 ))
  //               ) : (
  //               <View style={styles.noListingsContainer}>
  //                 <Ionicons name="calendar-outline" size={48} color="#ccc" />
  //                 <Text style={styles.noListingsText}>No bookings yet</Text>
  //                 <Text style={styles.noListingsSubtext}>
  //                   Your booking history will appear here
  //                 </Text>
  //                 <TouchableOpacity onPress={handleUserBookings} style={styles.primaryButton}>
  //                   <Text style={styles.primaryButtonText}>View All Bookings</Text>
  //                 </TouchableOpacity>
  //               </View>
  //               )}
  //             </View>
  //           </ScrollView>
  //         </View>
  //       );

  //     case 'userBooked':
  //       return (
  //         <View style={styles.tabContent}>
  //           <View style={styles.listingsHeader}>
  //             <Text style={styles.listingsTitle}>User Bookings</Text>
  //             <View style={styles.headerActions}>
  //               <TouchableOpacity onPress={handleOwnerBookings} style={styles.navButton}>
  //                 <Text style={styles.navButtonText}>View All</Text>
  //               </TouchableOpacity>
  //               <TouchableOpacity onPress={handleTestBookings}>
  //                 <Text style={styles.testButtonText}>Test</Text>
  //               </TouchableOpacity>
  //             </View>
  //           </View>
  //           <ScrollView showsVerticalScrollIndicator={false}>
  //             <View style={styles.listingsContainer}>
  //               {bookingsLoading ? (
  //                 <View style={styles.loadingContainer}>
  //                   <ActivityIndicator size="large" color="#007AFF" />
  //                   <Text style={styles.loadingText}>Loading bookings...</Text>
  //                 </View>
  //               ) : userBookings && userBookings.length > 0 ? (
  //                 userBookings.map((booking) => (
  //                   <BookingCard
  //                     key={booking._id}
  //                     booking={booking}
  //                     onPress={() => handleBookingPress(booking)}
  //                     isOwner={true}
  //                   />
  //                 ))
  //               ) : (
  //               <View style={styles.noListingsContainer}>
  //                 <Ionicons name="people-outline" size={48} color="#ccc" />
  //                 <Text style={styles.noListingsText}>No user bookings</Text>
  //                 <Text style={styles.noListingsSubtext}>
  //                   Bookings made by users will appear here
  //                 </Text>
  //                 <TouchableOpacity onPress={handleOwnerBookings} style={styles.primaryButton}>
  //                   <Text style={styles.primaryButtonText}>View All Bookings</Text>
  //                 </TouchableOpacity>
  //               </View>
  //               )}
  //             </View>
  //           </ScrollView>
  //         </View>
  //       );

  //     case 'earnings':
  //       return (
  //         <View style={styles.tabContent}>
  //           <View style={styles.listingsHeader}>
  //             <Text style={styles.listingsTitle}>My Earnings</Text>
  //             <TouchableOpacity onPress={handleEarningsPress}>
  //               <Text style={styles.seeAllText}>View Details</Text>
  //             </TouchableOpacity>
  //           </View>
  //           <ScrollView showsVerticalScrollIndicator={false}>
  //             <View style={styles.listingsContainer}>
  //               {earningsLoading ? (
  //                 <View style={styles.loadingContainer}>
  //                   <ActivityIndicator size="large" color="#007AFF" />
  //                   <Text style={styles.loadingText}>Loading earnings...</Text>
  //                 </View>
  //               ) : earnings ? (
  //               <View style={styles.earningsSummary}>
  //                 <View style={styles.earningsCard}>
  //                   <Text style={styles.earningsLabel}>Total Earnings</Text>
  //                     <Text style={styles.earningsAmount}>
  //                       ₹{(earnings.totalEarnings || 0).toLocaleString()}
  //                     </Text>
  //                 </View>
  //                 <View style={styles.earningsCard}>
  //                     <Text style={styles.earningsLabel}>Completed Bookings</Text>
  //                     <Text style={styles.earningsAmount}>
  //                       {earnings.completedBookings || 0}
  //                     </Text>
  //                 </View>
  //                   <View style={styles.earningsCard}>
  //                     <Text style={styles.earningsLabel}>Pending Payout</Text>
  //                     <Text style={styles.earningsAmount}>
  //                       ₹{(earnings.pendingPayout || 0).toLocaleString()}
  //                     </Text>
  //               </View>
  //                   <View style={styles.earningsCard}>
  //                     <Text style={styles.earningsLabel}>Total Paid Out</Text>
  //                     <Text style={styles.earningsAmount}>
  //                       ₹{(earnings.totalPayout || 0).toLocaleString()}
  //                     </Text>
  //                   </View>
  //                 </View>
  //               ) : (
  //               <View style={styles.noListingsContainer}>
  //                 <Ionicons name="wallet-outline" size={48} color="#ccc" />
  //                 <Text style={styles.noListingsText}>No earnings yet</Text>
  //                 <Text style={styles.noListingsSubtext}>
  //                   Your earnings will appear here once you start receiving bookings
  //                 </Text>
  //               </View>
  //               )}
  //             </View>
  //           </ScrollView>
  //         </View>
  //       );

  //     default:
  //       return null;
  //   }
  // };

  const requiredFields = ['name', 'email', 'phone', 'address', 'profilePic'];
  const missingFields = requiredFields.filter(field => !userData?.[field]);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
            onPress={fetchUserData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <Image 
              source={
                userData?.profilePic
                  ? { uri: userData.profilePic }
                  : require('../../../assets/photo/08.png')
              }
              style={styles.profilePic}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{userData?.email || 'No email added'}</Text>
              <Text style={styles.userPhone}>{userData?.phone || 'No phone added'}</Text>
              <Text style={styles.userAddress}>{userData?.address || 'No address added'}</Text>
              {userData?.location?.coordinates && (
                <TouchableOpacity 
                  style={styles.locationContainer}
                  onPress={() => setShowCoordinates(!showCoordinates)}
                >
                  <Ionicons name="location" size={14} color="#666" />
                  {locationLoading ? (
                    <Text style={styles.locationLoading}>Loading location...</Text>
                  ) : showCoordinates ? (
                    <Text style={styles.userLocation}>
                      {userData.location.coordinates[1].toFixed(6)}, {userData.location.coordinates[0].toFixed(6)}
                    </Text>
                  ) : locationName ? (
                    <Text style={styles.userLocation}>{locationName}</Text>
                  ) : (
                    <Text style={styles.locationError}>Location unavailable</Text>
                  )}
                  <Ionicons 
                    name={showCoordinates ? "map-outline" : "information-circle-outline"} 
                    size={12} 
                    color="#007AFF" 
                    style={styles.locationToggle}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile', { userData })}>
            <Ionicons name="pencil" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      {missingFields.length > 0 && (
        <View style={styles.profileWarning}>
          <Ionicons name="alert-circle" size={18} color="#FF9500" style={{ marginRight: 6 }} />
          <Text style={styles.warningText}>
            Please complete your profile: {missingFields.join(', ')}
          </Text>
        </View>
      )}
      {/* Member Since */}
      <View style={styles.memberSinceContainer}>
        <Text style={styles.memberSinceText}>
          Member since {formatDate(userData?.createdAt)}
        </Text>
      </View>
      {/* Summary Cards - Two per row, professional look */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyListings')}>
            <Ionicons name="list" size={28} color="#007AFF" style={styles.cardIcon} />
            <Text style={styles.statNumber}>{(userData?.rooms?.length || 0) + (userData?.vehicles?.length || 0)}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyBookings')}>
            <Ionicons name="calendar" size={28} color="#007AFF" style={styles.cardIcon} />
            <Text style={styles.statNumber}>{myBookings.length}</Text>
            <Text style={styles.statLabel}>My Bookings</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('UserBooked')}>
            <Ionicons name="people" size={28} color="#007AFF" style={styles.cardIcon} />
            <Text style={styles.statNumber}>{userBookings.length}</Text>
            <Text style={styles.statLabel}>User Booked</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Earnings')}>
            <Ionicons name="wallet" size={28} color="#007AFF" style={styles.cardIcon} />
            <Text style={styles.statNumber}>{earnings !== null ? `₹${earnings.totalEarnings}` : 0}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
  statsGrid: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardIcon: {
    marginBottom: 8,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
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
  userPhone: {
    color: '#666',
    marginTop: 2,
    fontSize: 14,
  },
  userLocation: {
    color: '#666',
    marginLeft: 5,
    fontSize: 14,
  },
  memberSinceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberSinceText: {
    color: '#666',
    fontSize: 14,
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    flexDirection: 'col ',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  earningsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  listingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  toggleButton: {
    backgroundColor: '#F1F8E9',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 12,
    padding: 5,
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
  primaryButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  warningText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '500',
  },
  userAddress: {
    color: '#666',
    marginTop: 2,
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationLoading: {
    color: '#666',
    marginLeft: 5,
    fontSize: 14,
    fontStyle: 'italic',
  },
  locationError: {
    color: '#FF3B30',
    marginLeft: 5,
    fontSize: 14,
    fontStyle: 'italic',
  },
  locationToggle: {
    marginLeft: 5,
  },
});

export default ProfileScreen; 