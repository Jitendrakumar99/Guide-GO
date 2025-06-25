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
import AddListingScreen from '../screens/listing/AddListingScreen';
import EditListingScreen from '../screens/listing/EditListingScreen';
import BookingFormScreen from '../screens/booking/BookingFormScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import MyBookingsScreen from '../screens/profile/MyBookingsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EarningsScreen from '../screens/profile/EarningsScreen';
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';
import UserBookingsScreen from '../screens/booking/UserBookingsScreen';
import OwnerBookingsScreen from '../screens/booking/OwnerBookingsScreen';
import Login from '../screens/auth/login';
import Signup from '../screens/auth/signup';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

// Auth Stack
export const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Signup" component={Signup} />
    <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ headerShown: true, title: 'Forgot Password' }} />
  </Stack.Navigator>
);

// Home Stack
export const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="TourDetails" component={TourDetails} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    <Stack.Screen name="UserBookings" component={UserBookingsScreen} />
    <Stack.Screen name="OwnerBookings" component={OwnerBookingsScreen} />
  </Stack.Navigator>
);

// Tour Stack
export const TourStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TourScreen" component={TourScreen} />
    <Stack.Screen name="TourDetails" component={TourDetails} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    <Stack.Screen name="UserBookings" component={UserBookingsScreen} />
    <Stack.Screen name="OwnerBookings" component={OwnerBookingsScreen} />
  </Stack.Navigator>
);

// Room Stack
export const RoomStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RoomScreen" component={RoomScreen} />
    <Stack.Screen name="RoomDetails" component={RoomDetails} />
    <Stack.Screen name="RoomRating" component={RoomRating} />
    <Stack.Screen name="BookingForm" component={BookingFormScreen} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    <Stack.Screen name="UserBookings" component={UserBookingsScreen} />
    <Stack.Screen name="OwnerBookings" component={OwnerBookingsScreen} />
  </Stack.Navigator>
);

// Vehicle Stack
export const VehicleStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VehicleScreen" component={VehicleScreen} />
    <Stack.Screen name="VehicleDetails" component={VehicleDetails} />
    <Stack.Screen name="BookingForm" component={BookingFormScreen} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    <Stack.Screen name="UserBookings" component={UserBookingsScreen} />
    <Stack.Screen name="OwnerBookings" component={OwnerBookingsScreen} />
  </Stack.Navigator>
);

// Profile Stack
export const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfile} />
    <Stack.Screen name="AddListing" component={AddListingScreen} />
    <Stack.Screen name="EditListing" component={EditListingScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Earnings" component={EarningsScreen} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    <Stack.Screen name="UserBookings" component={UserBookingsScreen} />
    <Stack.Screen name="OwnerBookings" component={OwnerBookingsScreen} />
  </Stack.Navigator>
); 