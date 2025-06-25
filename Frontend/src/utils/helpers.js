import * as Location from 'expo-location';

// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format currency
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Calculate days between two dates
export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#FFA500';
    case 'confirmed': return '#4CAF50';
    case 'cancelled': return '#F44336';
    case 'completed': return '#2196F3';
    default: return '#757575';
  }
};

// Get payment status color
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#FFA500';
    case 'paid': return '#4CAF50';
    case 'refunded': return '#F44336';
    default: return '#757575';
  }
};

// Distance calculation utility functions
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

// Get current location using expo-location
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 10,
    });

    return {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

// Calculate distance between two points using GeoJSON coordinates
export const calculateDistanceFromCoordinates = (coord1, coord2) => {
  if (!coord1 || !coord2 || !Array.isArray(coord1) || !Array.isArray(coord2)) {
    return null;
  }
  
  // GeoJSON format: [longitude, latitude]
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  return calculateDistance(lat1, lon1, lat2, lon2);
};

// Sort items by distance from current location
export const sortByDistance = (items, currentLocation) => {
  if (!currentLocation) return items;

  return items
    .map(item => {
      const distance = item.location?.coordinates 
        ? calculateDistanceFromCoordinates(currentLocation, item.location.coordinates)
        : null;
      
      return {
        ...item,
        distance,
        distanceFormatted: distance ? formatDistance(distance) : 'Unknown'
      };
    })
    .filter(item => item.distance !== null)
    .sort((a, b) => a.distance - b.distance);
};

// Filter items by maximum distance
export const filterByDistance = (items, currentLocation, maxDistance) => {
  if (!currentLocation || !maxDistance) return items;

  return items.filter(item => {
    if (!item.location?.coordinates) return false;
    
    const distance = calculateDistanceFromCoordinates(
      currentLocation, 
      item.location.coordinates
    );
    
    return distance !== null && distance <= maxDistance;
  });
}; 