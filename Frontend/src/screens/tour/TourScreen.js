import React, { useState } from 'react';
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
import StatusBar from '../../components/StatusBar';

const { width } = Dimensions.get('window');

const TourCard = ({ image, title, type, location, rating, price, duration, spots, onPress }) => (
  <TouchableOpacity style={styles.tourCard} onPress={onPress}>
    <Image source={image} style={styles.tourImage} resizeMode="cover" />
    <View style={styles.tourContent}>
      <View style={styles.tourHeader}>
        <Text style={styles.tourTitle}>{title}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
      <View style={styles.typeContainer}>
        <Ionicons name="map" size={16} color="#007AFF" />
        <Text style={styles.typeText}>{type}</Text>
      </View>
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={16} color="#007AFF" />
        <Text style={styles.locationText}>{location}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color="#007AFF" />
          <Text style={styles.detailText}>{duration}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people" size={16} color="#007AFF" />
          <Text style={styles.detailText}>{spots} spots left</Text>
        </View>
      </View>
      <Text style={styles.priceText}>${price}/person</Text>
    </View>
  </TouchableOpacity>
);

const TourScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = ['All', 'Adventure', 'Cultural', 'Nature'];

  const tours = [
    {
      id: '1',
      image: require('../../../assets/photo/02.jpg'),
      title: 'Mountain Trekking',
      type: 'Adventure',
      location: 'Himalayas, India',
      rating: '4.9',
      price: '75',
      duration: '3 days',
      spots: 12,
      description: 'Experience the thrill of trekking through the majestic Himalayas'
    },
    {
      id: '2',
      image: require('../../../assets/photo/02.jpg'),
      title: 'Taj Mahal Tour',
      type: 'Cultural',
      location: 'Agra, India',
      rating: '4.8',
      price: '45',
      duration: '1 day',
      spots: 20,
      description: 'Visit one of the Seven Wonders of the World'
    },
    {
      id: '3',
      image: require('../../../assets/photo/03.jpg'),
      title: 'Wildlife Safari',
      type: 'Nature',
      location: 'Ranthambore, India',
      rating: '4.7',
      price: '90',
      duration: '2 days',
      spots: 8,
      description: 'Spot tigers and other wildlife in their natural habitat'
    }
  ];

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || tour.type.toLowerCase() === selectedFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Tours</Text>
        <Text style={styles.headerSubtitle}>Discover amazing experiences</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tours by name or location..."
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

      {/* Tours List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.toursContainer}>
          {filteredTours.map(tour => (
            <TourCard
              key={tour.id}
              {...tour}
              onPress={() => navigation.navigate('TourDetails', { tour })}
            />
          ))}
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
  toursContainer: {
    padding: 15,
  },
  tourCard: {
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
  tourImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tourContent: {
    padding: 15,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tourTitle: {
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
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
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
});

export default TourScreen; 