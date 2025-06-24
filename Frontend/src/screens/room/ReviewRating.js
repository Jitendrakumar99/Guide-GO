import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRatings, submitRating, getCurrentUser } from '../../utils/api';
import { log } from 'console';

const { width } = Dimensions.get('window');

// Enhanced RatingStars component with working rating functionality
const RatingStars = ({ rating, setRating, size = 24, disabled = false }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !disabled && setRating && setRating(star)}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
          style={{ padding: 2 }}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? "#FFD700" : "#D3D3D3"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Rating distribution bar component
const RatingBar = ({ percentage, count, rating }) => {
  return (
    <View style={styles.ratingBarContainer}>
      <Text style={styles.ratingNumber}>{rating}</Text>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.ratingCount}>{count}</Text>
    </View>
  );
};

const ReviewRating = ({ itemId, itemType }) => {
  console.log('ReviewRating component mounted with itemId:', itemId, 'and itemType:', itemType);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [openRate, setOpenRate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); 
  const [hasError, setHasError] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    let query = {};
    if (itemType === 'room') query.roomId = itemId;
    if (itemType === 'vehicle') query.vehicleId = itemId;
    if (itemType === 'guide') query.guideId = itemId;
    getRatings(query)
      .then(data => {
        setReviews(data.ratings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [itemId, itemType]);

  useEffect(() => {
    getCurrentUser()
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  const handleSubmitReview = () => {
    if (userRating === 0 || reviewText.trim() === '') {
      setHasError(true);
      return;
    }
    setLoading(true);
    submitRating({
      itemId,
      itemType,
      rating: userRating,
      text: reviewText,
      name: currentUser?.name || 'Anonymous User',
      avatar: currentUser?.profilePic || '',
    })
      .then(newReview => {
        setReviews([newReview, ...reviews]);
        setReviewText('');
        setUserRating(0);
        setOpenRate(false);
        setHasError(false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const calculateRatingStats = () => {
    let total = 0;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      total += review.rating;
      counts[review.rating]++;
    });
    const average = reviews.length > 0 ? (total / reviews.length).toFixed(1) : '0.0';
    return {
      average,
      counts,
      total: reviews.length
    };
  };

  const stats = calculateRatingStats();
  
  const getFilteredReviews = () => {
    if (filter === 'all') return reviews;
    if (filter === 'positive') return reviews.filter(review => review.rating >= 3);
    if (filter === 'negative') return reviews.filter(review => review.rating <= 2);
    return reviews;
  };

  const filteredReviews = getFilteredReviews();

  return (
    <SafeAreaView style={styles.container}>
      {/* Rating Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.averageContainer}>
          <Text style={styles.averageRating}>{stats.average}</Text>
          <RatingStars rating={Math.round(parseFloat(stats.average))} disabled={true} size={24} />
          <Text style={styles.totalReviews}>{stats.total} reviews</Text>
        </View>
        <View style={{borderLeftWidth:1,borderLeftColor:'#f0f0f0',paddingLeft:10}}></View>
        <View style={styles.distributionContainer}>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.counts[rating] || 0;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <RatingBar 
                key={rating} 
                rating={rating} 
                percentage={percentage} 
                count={count} 
              />
            );
          })}
        </View>
      </View>

      {/* Write Review Button */}
      <TouchableOpacity 
        style={{color:'blue',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,marginBottom:15}} 
        onPress={() => setOpenRate(!openRate)}
      >
        <Ionicons name="create-outline" size={25} color="blue" />
        <Text style={{color:'blue',fontSize:16,fontWeight:'600'}}>Write a Review</Text>
      </TouchableOpacity>

      {/* Review Form */}
      {openRate && (
        <View style={styles.reviewForm}>
          <Text style={styles.reviewFormTitle}>Share Your Experience</Text>
          {currentUser && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Image
                source={{ uri: currentUser.profilePic || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
              />
              <Text style={{ fontWeight: '600', fontSize: 16 }}>{currentUser.name}</Text>
          </View>
          )}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Rating<Text style={styles.required}>*</Text></Text>
            <RatingStars 
              rating={userRating} 
              setRating={setUserRating} 
              size={32} 
            />
            {hasError && userRating === 0 && (
              <Text style={styles.errorText}>Please select a rating</Text>
            )}
          </View>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Your Review<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Tell us about your experience..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={4}
            />
            {hasError && reviewText.trim() === '' && (
              <Text style={styles.errorText}>Please write a review</Text>
            )}
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setOpenRate(false);
                setHasError(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={()=>handleSubmitReview()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'positive' && styles.activeFilter]}
          onPress={() => setFilter('positive')}
        >
          <Text style={[styles.filterButtonText, filter === 'positive' && styles.activeFilterText]}>Positive</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'negative' && styles.activeFilter]}
          onPress={() => setFilter('negative')}
        >
          <Text style={[styles.filterButtonText, filter === 'negative' && styles.activeFilterText]}>Negative</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : (
        <>
        {reviews.length>0 && <Text style={styles.reviewsTitle}>{filteredReviews.length} Reviews</Text>}
          <FlatList
            data={filteredReviews}
            keyExtractor={item => item._id ? item._id.toString() : item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Image 
                    source={{ uri: item.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                    style={styles.avatar}
                    defaultSource={require('../../../assets/photo/pac1.jpg')}
                  />
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{item.name}</Text>
                    <Text style={styles.reviewDate}>{item.date ? item.date : ''}</Text>
                  </View>
                  <View style={styles.reviewRating}>
                    <RatingStars rating={item.rating} size={16} disabled={true} />
                  </View>
                </View>
                <Text style={styles.reviewText}>{item.text}</Text>
              </View>
            )}
            ListEmptyComponent={
                filteredReviews.length === 0 ? (
                  reviews.length > 0 ? ( // Check if there are reviews but none match the filter
                    <View style={styles.emptyContainer}>
                      <Ionicons name="filter-outline" size={50} color="#cccccc" />
                      <Text style={styles.emptyText}>No reviews match the selected filter</Text>
                      <Text style={styles.emptySubtext}>Try adjusting your filter criteria</Text>
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="chatbubble-ellipses-outline" size={50} color="#cccccc" />
                      <Text style={styles.emptyText}>No reviews yet</Text>
                      <Text style={styles.emptySubtext}>Be the first to share your experience!</Text>
                    </View>
                  )
                ) : null
              }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
    gap:10
  },
  averageContainer: {
    width: '35%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 15,
   
    marginRight:10
  },
  averageRating: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  distributionContainer: {
    flex: 1,
    // marginLeft: 15,
    justifyContent: 'space-between',
    
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  ratingNumber: {
    width: 15,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  ratingCount: {
    width: 30,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginLeft: 8,
  },
  writeReviewButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  writeReviewText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  reviewForm: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  reviewFormTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  required: {
    color: 'red',
  },
  nameInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 10,
    color: '#444',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  reviewsTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  reviewItem: {
    marginBottom: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
});

export default ReviewRating;
