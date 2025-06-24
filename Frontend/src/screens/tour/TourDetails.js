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

const { width } = Dimensions.get('window');

const defaultImage = require('../../../assets/photo/pac-search-bg.jpg');

const TourDetails = ({ route, navigation }) => {
  const { tour } = route.params;

  // Use gallery images from tour.images if available, else fallback to default images
  const galleryImages = tour.images && tour.images.length > 0
    ? tour.images
    : [
        require('../../../assets/photo/03.jpg'),
        require('../../../assets/photo/04.jpg'),
        require('../../../assets/photo/05.jpg'),
      ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={tour.image || galleryImages[0] || defaultImage} 
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
            <Text style={styles.title}>{tour.title}</Text>
            {tour.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{tour.rating}</Text>
              </View>
            )}
          </View>

          {tour.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.location}>{tour.location}</Text>
            </View>
          )}

          {tour.description && (
            <Text style={styles.description}>{tour.description}</Text>
          )}

          {/* Tour Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={24} color="#666" />
              <Text style={styles.infoText}>5-6 hours</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={24} color="#666" />
              <Text style={styles.infoText}>Max 10 people</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="language-outline" size={24} color="#666" />
              <Text style={styles.infoText}>English</Text>
            </View>
          </View>

          {/* Highlights */}
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlightsContainer}>
            <Text style={styles.highlightText}>• Professional tour guide</Text>
            <Text style={styles.highlightText}>• Hotel pickup and drop-off</Text>
            <Text style={styles.highlightText}>• All entrance fees included</Text>
            <Text style={styles.highlightText}>• Lunch included</Text>
          </View>

          {/* Gallery */}
          <Text style={styles.sectionTitle}>Gallery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
            {galleryImages.map((img, idx) => (
              <Image key={idx} source={img} style={styles.galleryImage} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  location: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    marginTop: 5,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  highlightsContainer: {
    marginBottom: 20,
  },
  highlightText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  gallery: {
    marginTop: 10,
  },
  galleryImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 10,
    marginRight: 10,
  },
});

export default TourDetails; 