import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import TourScreen from '../screens/tour/TourScreen';
import TourDetails from '../screens/tour/TourDetails';
import RoomScreen from '../screens/room/RoomScreen';
import RoomDetails from '../screens/room/RoomDetails';
import RoomRating from '../screens/room/ReviewRating';
import VehicleScreen from '../screens/vehicle/VehicleScreen';
import VehicleDetails from '../screens/vehicle/VehicleDetails';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfile from '../screens/profile/EditProfile';

const Stack = createStackNavigator();

// Home Stack
export const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="TourDetails" component={TourDetails} />
  </Stack.Navigator>
);

// Tour Stack
export const TourStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TourScreen" component={TourScreen} />
    <Stack.Screen name="TourDetails" component={TourDetails} />
  </Stack.Navigator>
);

// Room Stack
export const RoomStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RoomScreen" component={RoomScreen} />
    <Stack.Screen name="RoomDetails" component={RoomDetails} />
    <Stack.Screen name="RoomRating" component={RoomRating} />
  </Stack.Navigator>
);

// Vehicle Stack
export const VehicleStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VehicleScreen" component={VehicleScreen} />
    <Stack.Screen name="VehicleDetails" component={VehicleDetails} />
  </Stack.Navigator>
);

// Profile Stack
export const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfile} />
  </Stack.Navigator>
); 