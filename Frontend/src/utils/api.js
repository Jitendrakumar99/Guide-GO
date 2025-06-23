// Use this for web development
// const API_BASE_URL = 'http://localhost:3000';

// Use this for mobile development (replace with your computer's IP address)
const API_BASE_URL = 'http://192.168.137.1:3000'; // Updated to match device network

// You can also use Platform.select to automatically choose the right URL
// import { Platform } from 'react-native';
// const API_BASE_URL = Platform.select({
//   web: 'http://localhost:3000',
//   default: 'http://192.168.1.1:3000', // Replace with your IP
// });

// Add timeout to fetch requests
const fetchWithTimeout = async (url, options, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    console.log('Starting fetch request to:', url);
    console.log('Device network:', '192.168.141.31');
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 10 seconds');
    }
    throw error;
  }
};

const handleResponse = async (response) => {
  console.log('Response received:', {
    status: response.status,
  //   statusText: response.statusText,
  //   headers: Object.fromEntries(response.headers.entries())
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Error response:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log('Response data:', data);
  return data;
};

const handleError = (error) => {
  console.error('API Error Details:', {
    message: error.message,
    name: error.name,
    stack: error.stack
  });
  
  if (error.message === 'Network request failed' || error.message.includes('timed out')) {
    console.log('Connection test starting...');
    // Test basic connectivity
    fetch(`${API_BASE_URL}`, { method: 'HEAD' })
      .then(() => console.log('Server is reachable'))
      .catch(e => console.log('Server is not reachable:', e.message));
      
    throw new Error(
      'Connection failed. Please check:\n' +
      '1. Backend server is running (npm run dev in backend folder)\n' +
      '2. Your device and computer are on the same network\n' +
      '3. IP address is correct (current: ' + API_BASE_URL + ')\n' +
      '4. No firewall is blocking the connection\n' +
      '5. Try restarting both frontend and backend servers'
    );
  }
  throw error;
};

import AsyncStorage from '@react-native-async-storage/async-storage';

// Token management
let authToken = null;

export const setAuthToken = async (token) => {
  authToken = token;
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const getAuthToken = async () => {
  if (!authToken) {
    try {
      authToken = await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
    }
  }
  return authToken;
};

export const clearAuthToken = async () => {
  authToken = null;
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export const loginUser = async (email, password) => {
  try {
    console.log('=== Login Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/auth/login`);
    console.log('Method: POST');
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    console.log('Body:', { email, password: '***' });
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      }
    );
    
    console.log('=== Login Request Completed ===');
    const data = await handleResponse(response);
    
    // Store the token if login was successful
    if (data.token) {
      await setAuthToken(data.token);
    }
    
    return data;
  } catch (error) {
    console.log('=== Login Request Failed ===');
    return handleError(error);
  }
};

export const signupUser = async (userData) => {
  try {
    console.log('=== Signup Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/users`);
    console.log('Method: POST');
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    console.log('Body:', { ...userData, password: '***' });
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      }
    );
    
    console.log('=== Signup Request Completed ===');
    return handleResponse(response);
  } catch (error) {
    console.log('=== Signup Request Failed ===');
    return handleError(error);
  }
};

export const getAllUsers = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    console.log('=== Get All Users Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/users`);
    console.log('Method: GET');
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/users`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('=== Get All Users Request Completed ===');
    return handleResponse(response);
  } catch (error) {
    console.log('=== Get All Users Request Failed ===');
    return handleError(error);
  }
};

export const getUserById = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    console.log('=== Get User Data Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/users/me`);
    console.log('Method: GET');
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/users/me`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('=== Get User Data Request Completed ===');
    const userData = await handleResponse(response);
    
    // Transform the data to match our frontend needs
    return {
      id: userData._id,
      name: userData.name || '',
      email: userData.email,
      phone: userData.phone || '',
      profilePic: userData.profilePic || null,
      location: userData.location ? {
        type: userData.location.type,
        coordinates: userData.location.coordinates
      } : null,
      rooms: userData.rooms || [],
      vehicles: userData.vehicles || [],
      address: userData.address || '',
      notification: userData.notification || [],
      createdAt: userData.createdAt,
      earnings: {
        totalEarnings: { type: Number, default: 0 },
        completedBookings: { type: Number, default: 0 },
        pendingPayout: { type: Number, default: 0 },
        totalPayout: { type: Number, default: 0 }
      },
      earningsHistory: userData.earningsHistory || [],
      notifications: userData.notifications || [],
      createdAt: userData.createdAt,
      // Calculate stats
      stats: {
        totalListings: (userData.rooms?.length || 0) + (userData.vehicles?.length || 0),
        totalRooms: userData.rooms?.length || 0,
        totalVehicles: userData.vehicles?.length || 0
      }
    };
  } catch (error) {
    console.log('=== Get User Data Request Failed ===');
    return handleError(error);
  }
};

export const updateUser = async (userData) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    console.log('=== Update User Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/users/me`);
    console.log('Method: PUT');
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    console.log('Body:', { ...userData, password: '***' });
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/users/me`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      }
    );
    
    console.log('=== Update User Request Completed ===');
    return handleResponse(response);
  } catch (error) {
    console.log('=== Update User Request Failed ===');
    return handleError(error);
  }
};

export const getAllRooms = async () => {
  try {
    // console.log('=== Get All Rooms Request Starting ===');
    // console.log('URL:', `${API_BASE_URL}/rooms`);
    // console.log('Method: GET');
    // console.log('Headers:', {
    //   'Accept': 'application/json'
    // });
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/rooms`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('=== Get All Rooms Request Completed ===');
    const rooms = await handleResponse(response);
    
    // Transform the data to match our frontend needs
    return rooms.map(room => ({
      id: room._id,
      title: room.title || '',
      description: room.description || '',
      type: room.type || 'Standard',
      // Convert location object to a string representation
      location: room.location?.coordinates ? 
        `${room.location.coordinates[1]}, ${room.location.coordinates[0]}` : 
        'Location not specified',
      address: room.address || '',
      price: room.pricePerNight || 0,
      rating: room.rating || 0,
      images: room.images || [],
      amenities: room.amenities || [],
      capacity: room.capacity || 0,
      owner: room.owner ? {
        id: room.owner._id,
        name: room.owner.name || '',
        profilePic: room.owner.profilePic || null
      } : null,
      createdAt: room.createdAt
    }));
  } catch (error) {
    console.log('=== Get All Rooms Request Failed ===');
    return handleError(error);
  }
};

export const getAllVehicles = async () => {
  try {
    console.log('=== Get All Vehicles Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/vehicles`);
    console.log('Method: GET');
    console.log('Headers:', {
      'Accept': 'application/json'
    });
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/vehicles`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('=== Get All Vehicles Request Completed ===');
    const vehicles = await handleResponse(response);
    
    // Transform the data to match our frontend needs
    return vehicles.map(vehicle => ({
      id: vehicle._id,
      title: vehicle.title || '',
      description: vehicle.description || '',
      type: vehicle.type || 'Standard',
      // Convert location object to a string representation
      location: vehicle.location?.coordinates ? 
        `${vehicle.location.coordinates[1]}, ${vehicle.location.coordinates[0]}` : 
        'Location not specified',
      address: vehicle.address || '',
      price: vehicle.pricePerDay || 0,
      rating: vehicle.rating || 0,
      images: vehicle.images || [],
      features: vehicle.features || [],
      owner: vehicle.owner ? {
        id: vehicle.owner._id,
        name: vehicle.owner.name || '',
        profilePic: vehicle.owner.profilePic || null
      } : null,
      createdAt: vehicle.createdAt
    }));
  } catch (error) {
    console.log('=== Get All Vehicles Request Failed ===');
    return handleError(error);
  }
}; 

export const createRoom = async (roomData) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    // Get current user data to include owner information
    const userData = await getUserById();
    if (!userData || !userData.id) {
      throw new Error('Could not get user information');
    }

    // Add owner information to the room data
    const roomDataWithOwner = {
      ...roomData,
      ownerModel: "User",
      owner: userData.id
    };

    console.log('=== Create Room Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/rooms`);
    console.log('Method: POST');
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    console.log('Body:', roomDataWithOwner);
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/rooms`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(roomDataWithOwner)
      }
    );
    
    console.log('=== Create Room Request Completed ===');
    return handleResponse(response);
  } catch (error) {
    console.log('=== Create Room Request Failed ===');
    return handleError(error);
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    // Get current user data to include owner information
    const userData = await getUserById();
    if (!userData || !userData.id) {
      throw new Error('Could not get user information');
    }

    // Add owner information to the vehicle data
    const vehicleDataWithOwner = {
      ...vehicleData,
      ownerModel: "User",
      owner: userData.id
    };

    console.log('=== Create Vehicle Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/vehicles`);
    console.log('Method: POST');
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    console.log('Body:', vehicleDataWithOwner);
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/vehicles`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(vehicleDataWithOwner)
      }
    );
    
    console.log('=== Create Vehicle Request Completed ===');
    return handleResponse(response);
  } catch (error) {
    console.log('=== Create Vehicle Request Failed ===');
    return handleError(error);
  }
};

export const updateRoom = async (id, roomData) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  try {
    console.log('Updating room:', {
      url: `${API_BASE_URL}/rooms/${id}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: roomData,
    });

    const response = await fetchWithTimeout(`${API_BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating room:', error);
    throw handleError(error);
  }
};

export const updateVehicle = async (id, vehicleData) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  try {
    console.log('Updating vehicle:', {
      url: `${API_BASE_URL}/vehicles/${id}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: vehicleData,
    });

    const response = await fetchWithTimeout(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw handleError(error);
  }
};

export const deleteRoom = async (roomId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    console.log('=== Delete Room Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/rooms/${roomId}`);
    console.log('Method: DELETE');
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/rooms/${roomId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('=== Delete Room Request Completed ===');
    return handleResponse(response);
  } catch (error) {
    console.log('=== Delete Room Request Failed ===');
    return handleError(error);
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    console.log('=== Delete Vehicle Request Starting ===');
    console.log('URL:', `${API_BASE_URL}/vehicles/${vehicleId}`);
    console.log('Method: DELETE');
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/vehicles/${vehicleId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('=== Delete Vehicle Request Completed ===');
    return handleResponse(response);
  } catch (error) {
    console.log('=== Delete Vehicle Request Failed ===');
    return handleError(error);
  }
};

export const toggleListingStatus = async (type, id, newStatus) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    const endpoint = type === 'room' ? 'rooms' : 'vehicles';
    const updateFunction = type === 'room' ? updateRoom : updateVehicle;

    console.log(`=== Toggle ${type} Status Request Starting ===`);
    console.log('New Status:', newStatus);
    
    const response = await updateFunction(id, { status: newStatus });
    
    console.log(`=== Toggle ${type} Status Request Completed ===`);
    return response;
  } catch (error) {
    console.log(`=== Toggle ${type} Status Request Failed ===`);
    return handleError(error);
  }
};

export const getRoomById = async (id) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  try {
    // console.log('Fetching room:', `${API_BASE_URL}/rooms/${id}`);
    const response = await fetchWithTimeout(`${API_BASE_URL}/rooms/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching room:', error);
    throw handleError(error);
  }
};

export const getVehicleById = async (id) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  try {
    console.log('Fetching vehicle:', `${API_BASE_URL}/vehicles/${id}`);
    const response = await fetchWithTimeout(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw handleError(error);
  }
};

export const createBooking = async (bookingData) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  try {
    console.log('Creating booking:', {
      url: `${API_BASE_URL}/bookings`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: bookingData,
    });

    const response = await fetchWithTimeout(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw handleError(error);
  }
};

export const checkListingOwnership = async (listingId, listingType) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  try {
    const userData = await getCurrentUser();
    const endpoint = listingType === 'room' ? 'rooms' : 'vehicles';
    const response = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}/${listingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const listing = await handleResponse(response);
    return listing.owner === userData._id;
  } catch (error) {
    console.error('Error checking listing ownership:', error);
    throw handleError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    // console.log('=== Get Current User Request Starting ===');
    // console.log('URL:', `${API_BASE_URL}/users/me`);
    // console.log('Method: GET');
  
    
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/users/me`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('=== Get Current User Request Completed ===');
    return await handleResponse(response);
  } catch (error) {
    console.log('=== Get Current User Request Failed ===');
    throw handleError(error);
  }
};

// Import Firebase Storage
// import { initializeApp } from 'firebase/app';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import Constants from 'expo-constants';

// Initialize Firebase
// const firebaseConfig = {
//   apiKey: Constants.expoConfig.extra.firebaseApiKey,
//   authDomain: Constants.expoConfig.extra.firebaseAuthDomain,
//   projectId: Constants.expoConfig.extra.firebaseProjectId,
//   storageBucket: Constants.expoConfig.extra.firebaseStorageBucket,
//   messagingSenderId: Constants.expoConfig.extra.firebaseMessagingSenderId,
//   appId: Constants.expoConfig.extra.firebaseAppId,
// };

// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);

export const uploadImage = async (uri) => {
  try {
    console.log('=== Image Upload Starting ===');
    
    // Create form data
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/jpeg',
      name: 'upload.jpg'
    });

    // Get auth token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Upload image
    console.log('Uploading image to backend...');
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    const data = await response.json();
    console.log('=== Image Upload Completed ===');
    console.log('Image path:', data.imagePath);
    
    return data.imagePath;
  } catch (error) {
    console.error('=== Image Upload Failed ===');
    console.error('Error:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }
};

export const uploadMultipleImages = async (uris) => {
  try {
    console.log('=== Multiple Images Upload Starting ===');
    
    // Create form data
    const formData = new FormData();
    uris.forEach((uri, index) => {
      formData.append('images', {
        uri: uri,
        type: 'image/jpeg',
        name: `upload${index}.jpg`
      });
    });

    // Get auth token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Upload images
    console.log('Uploading images to backend...');
    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload images');
    }

    const data = await response.json();
    console.log('=== Multiple Images Upload Completed ===');
    console.log('Image paths:', data.imagePaths);
    
    return data.imagePaths;
  } catch (error) {
    console.error('=== Multiple Images Upload Failed ===');
    console.error('Error:', error);
    throw new Error('Failed to upload images: ' + error.message);
  }
};

// Get bookings made by the current user (when they book others' listings)
export const getUserBookings = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No auth token found');

    console.log('Fetching user bookings...'); // Debug log
    const response = await fetch(`${API_BASE_URL}/bookings/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('User bookings error:', error); // Debug log
      throw new Error(error.message || 'Failed to fetch user bookings');
    }

    const data = await response.json();
    console.log('User bookings response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error in getUserBookings:', error); // Debug log
    throw error;
  }
};

// Get bookings received by the current user (when others book their listings)
export const getOwnerBookings = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No auth token found');

    console.log('Fetching owner bookings...'); // Debug log
    const response = await fetch(`${API_BASE_URL}/bookings/owner`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Owner bookings error:', error); // Debug log
      throw new Error(error.message || 'Failed to fetch owner bookings');
    }

    const data = await response.json();
    console.log('Owner bookings response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error in getOwnerBookings:', error); // Debug log
    throw error;
  }
};

// Get a single booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No auth token found');

    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch booking details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching booking details:', error);
    throw error;
  }
};

// Update booking status (for owners)
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No auth token found');

    console.log('Updating booking status');
    console.log('Booking ID:', bookingId);
    console.log('New status:', status);
    console.log('Using token:', token.substring(0, 20) + '...');
    console.log('Request URL:', `${API_BASE_URL}/bookings/${bookingId}/status`);

    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const error = await response.json();
      console.error('Update booking status error response:', error);
      throw new Error(error.message || 'Failed to update booking status');
    }

    const data = await response.json();
    console.log('Update booking status success response:', data);
    return data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Cancel booking (for users)
export const cancelBooking = async (bookingId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No auth token found');

    console.log('Cancelling booking with ID:', bookingId);
    console.log('Using token:', token.substring(0, 20) + '...');
    console.log('Request URL:', `${API_BASE_URL}/bookings/${bookingId}/cancel`);

    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const error = await response.json();
      console.error('Cancel booking error response:', error);
      throw new Error(error.message || 'Failed to cancel booking');
    }

    const data = await response.json();
    console.log('Cancel booking success response:', data);
    return data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Get all bookings (for testing)
export const getAllBookings = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No auth token found');

    console.log('Fetching all bookings...'); // Debug log
    const response = await fetch(`${API_BASE_URL}/bookings/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('All bookings error:', error); // Debug log
      throw new Error(error.message || 'Failed to fetch all bookings');
    }

    const data = await response.json();
    console.log('All bookings response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error in getAllBookings:', error); // Debug log
    throw error;
  }
};

// Get current user's earnings summary
export const getUserEarnings = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No auth token found');

    const response = await fetch(`${API_BASE_URL}/users/me/earnings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch earnings');
    }

    const data = await response.json();
    return data.earnings;
  } catch (error) {
    console.error('Error fetching user earnings:', error);
    throw error;
  }
};

// Get current user's earnings history
export const getUserEarningsHistory = async (page = 1, limit = 10) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No auth token found');

    const response = await fetch(`${API_BASE_URL}/users/me/earnings/history?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch earnings history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching earnings history:', error);
    throw error;
  }
}; 