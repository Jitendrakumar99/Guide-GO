import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBar from '../../components/StatusBar';
import { getCurrentUser } from '../../utils/api';

const { width } = Dimensions.get('window');
const backend_url="http://192.168.141.31:3000"||process.env.backend_url;
const defaultImage = require('../../../assets/photo/toyota-innova.jpg');
const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={24} color="#007AFF" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const VehicleDetails = ({ route, navigation }) => {
  const { vehicle } = route.params;
  const [isOwner, setIsOwner] = useState(false);

  const getFeatureIcon = (feature) => {
    switch (feature.toLowerCase()) {
      case '7 seater':
      case '5 seater': return 'people';
      case 'automatic': return 'settings';
      case 'manual': return 'git-branch';
      case 'diesel': return 'water';
      case 'petrol': return 'flame';
      case 'ac': return 'snow';
      case 'premium audio': return 'musical-notes';
      default: return 'checkmark-circle';
    }
  };

  const handleBookNow = async () => {
    if (isOwner) {
      Alert.alert('Cannot Book', 'You cannot book your own listing.');
      return;
    }

    try {
      // Get current user data for validation
      const userData = await getCurrentUser();
      if (!userData) {
        throw new Error('Please login to book a vehicle');
      }

      // Navigate to booking form with existing vehicle data
      navigation.navigate('BookingForm', {
        listing: vehicle,  // vehicle already contains owner information
        listingType: 'vehicle'
      });
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.message || 'Failed to proceed with booking');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={vehicle.images?.[0] ? { uri: `${backend_url}/${vehicle.images[0]}` } : defaultImage} 
            style={styles.image} 
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{vehicle.title}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{vehicle.rating}</Text>
            </View>
          </View>

          <View style={styles.typeContainer}>
            <Ionicons name="car" size={20} color="#007AFF" />
            <Text style={styles.type}>{vehicle.type}</Text>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.location}>{vehicle.location}</Text>
          </View>

          <Text style={styles.description}>{vehicle.description}</Text>

          {/* Vehicle Features */}
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            {vehicle.features.map((feature, index) => (
              <FeatureItem
                key={index}
                icon={getFeatureIcon(feature)}
                text={feature}
              />
            ))}
          </View>

          {/* Rules */}
          <Text style={styles.sectionTitle}>Rental Rules</Text>
          <View style={styles.rulesContainer}>
            <Text style={styles.ruleText}>• Valid driver's license required</Text>
            <Text style={styles.ruleText}>• Security deposit required</Text>
            <Text style={styles.ruleText}>• Minimum age: 21 years</Text>
            <Text style={styles.ruleText}>• Return with full fuel tank</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price per day</Text>
          <Text style={styles.price}>${vehicle.price}<Text style={styles.perDay}>/day</Text></Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  rating: {
    marginLeft: 5,
    color: '#FFB800',
    fontWeight: 'bold',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  type: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  location: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 15,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
  rulesContainer: {
    marginBottom: 20,
  },
  ruleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  perDay: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VehicleDetails; 