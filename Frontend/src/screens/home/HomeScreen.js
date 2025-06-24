import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import StatusBar from '../../components/StatusBar';
import { getCurrentUser } from '../../utils/api';

const { width } = Dimensions.get('window');

const FeatureCard = ({ image, title, location, rating, onPress }) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <Image source={image} style={styles.featureImage} />
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={16} color="#007AFF" />
        <Text style={styles.locationText}>{location}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const PopularCard = ({ image, title, description, price }) => (
  <TouchableOpacity style={styles.popularCard}>
    <Image source={image} style={styles.popularImage} />
    <View style={styles.popularContent}>
      <Text style={styles.popularTitle}>{title}</Text>
      <Text style={styles.popularDescription} numberOfLines={2}>{description}</Text>
      <Text style={styles.popularPrice}>${price}/day</Text>
    </View>
  </TouchableOpacity>
);

const roomData = [
  {
    id: '1',
    image: require('../../../assets/photo/10.jpg'),
    title: 'Deluxe Room',
    location: 'Mumbai, India',
    price: '120',
  },
  {
    id: '2',
    image: require('../../../assets/photo/12.jpg'),
    title: 'Sea View Suite',
    location: 'Goa, India',
    price: '200',
  },
  {
    id: '3',
    image: require('../../../assets/photo/14.jpg'),
    title: 'Mountain Cabin',
    location: 'Manali, India',
    price: '150',
  },
];

const vehicleData = [
  {
    id: '1',
    image: require('../../../assets/photo/2015_mercedes-benz_c-class_34_1920x1080.jpg'),
    title: 'Mercedes C-Class',
    location: 'Delhi, India',
    price: '80',
  },
  {
    id: '2',
    image: require('../../../assets/photo/New-2020-Honda-City.jpg'),
    title: 'Honda City',
    location: 'Bangalore, India',
    price: '60',
  },
  {
    id: '3',
    image: require('../../../assets/photo/toyota-innova.jpg'),
    title: 'Toyota Innova',
    location: 'Hyderabad, India',
    price: '70',
  },
];

const RoomCard = ({ image, title, location, price, onPress }) => (
  <TouchableOpacity style={styles.popularCard} onPress={onPress}>
    <Image source={image} style={styles.popularImage} />
    <View style={styles.popularContent}>
      <Text style={styles.popularTitle}>{title}</Text>
      <Text style={styles.popularDescription}>{location}</Text>
      <Text style={styles.popularPrice}>${price}/night</Text>
    </View>
  </TouchableOpacity>
);

const VehicleCard = ({ image, title, location, price, onPress }) => (
  <TouchableOpacity style={styles.popularCard} onPress={onPress}>
    <Image source={image} style={styles.popularImage} />
    <View style={styles.popularContent}>
      <Text style={styles.popularTitle}>{title}</Text>
      <Text style={styles.popularDescription}>{location}</Text>
      <Text style={styles.popularPrice}>${price}/day</Text>
    </View>
  </TouchableOpacity>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const featuredData = [
    {
      id: '1',
      image: require('../../../assets/photo/21.jpg'),
      title: 'Beach Paradise',
      location: 'Goa, India',
      rating: '4.8'
    },
    {
      id: '2',
      image: require('../../../assets/photo/19.jpg'),
      title: 'Mountain Retreat',
      location: 'Manali, India',
      rating: '4.7'
    },
    {
      id: '3',
      image: require('../../../assets/photo/17.jpg'),
      title: 'Desert Safari',
      location: 'Jaisalmer, India',
      rating: '4.6'
    }
  ];

  const popularData = [
    {
      id: '1',
      image: require('../../../assets/photo/15.jpg'),
      title: 'Historical Tour',
      description: 'Explore ancient monuments and rich culture of the city',
      price: '99'
    },
    {
      id: '2',
      image: require('../../../assets/photo/13.jpg'),
      title: 'Adventure Package',
      description: 'Experience thrilling activities and natural beauty',
      price: '149'
    },
    {
      id: '3',
      image: require('../../../assets/photo/16.jpg'),
      title: 'Cultural Experience',
      description: 'Immerse yourself in local traditions and customs',
      price: '79'
    }
  ];

  const handleFeaturePress = (item) => {
    navigation.navigate('TourDetails', { tour: item });
  };

  const handlePopularPress = (item) => {
    navigation.navigate('TourDetails', { tour: item });
  };

  const handleSeeAllFeatures = () => {
    navigation.navigate('Tours', { screen: 'TourScreen' });
  };

  const handleSeeAllPopular = () => {
    navigation.navigate('Tours', { screen: 'TourScreen', params: { filter: 'popular' } });
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{loading ? '...' : user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            {user?.profilePic ? (
              <Image
                source={{ uri: user.profilePic }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <Ionicons name="person-circle" size={40} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            placeholderTextColor="gray"
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Destinations</Text>
              <TouchableOpacity onPress={handleSeeAllFeatures}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredData.map(item => (
                <FeatureCard 
                  key={item.id} 
                  {...item} 
                  onPress={() => handleFeaturePress(item)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Available Rooms */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Rooms</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Rooms', { screen: 'RoomScreen' })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {roomData.map(item => (
                <RoomCard
                  key={item.id}
                  {...item}
                  onPress={() => navigation.navigate('RoomDetails', { room: item })}
                />
              ))}
            </ScrollView>
          </View>

          {/* Available Vehicles */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Vehicles</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Vehicles', { screen: 'VehicleScreen' })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vehicleData.map(item => (
                <VehicleCard
                  key={item.id}
                  {...item}
                  onPress={() => navigation.navigate('VehicleDetails', { vehicle: item })}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    margin: 15,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 16,
    color: '#666'
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 14,
  },
  featureCard: {
    width: width * 0.8,
    height: width * 0.5,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureImage: {
    width: '100%',
    height: '70%',
  },
  featureContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 5,
  },
  popularCard: {
    width: width * 0.8,
    height: width * 0.5,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popularImage: {
    width: '100%',
    height: '70%',
  },
  popularContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  popularDescription: {
    fontSize: 14,
    color: '#fff',
  },
  popularPrice: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen; 