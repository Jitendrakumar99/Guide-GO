import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StatusBar } from 'react-native';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import AuthScreen from './src/screens/auth/AuthScreen';
import Login from './src/screens/auth/login';
import SignUp from "./src/screens/auth/signup";
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import MyListingsScreen from './src/screens/profile/MyListingsScreen';
import MyBookingsScreen from './src/screens/profile/MyBookingsScreen';
import UserBookedScreen from './src/screens/profile/UserBookedScreen';
import EarningsScreen from './src/screens/profile/EarningsScreen';
import AddListingScreen from './src/screens/listing/AddListingScreen';
import EditListingScreen from './src/screens/listing/EditListingScreen';
import RoomDetails from './src/screens/room/RoomDetails';
import VehicleDetails from './src/screens/vehicle/VehicleDetails';
import BookingDetailsScreen from './src/screens/booking/BookingDetailsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import HelpSupportScreen from './src/screens/profile/HelpSupportScreen';
import SettingsScreen from './src/screens/profile/SettingsScreen';
import PaymentMethodsScreen from './src/screens/profile/PaymentMethodsScreen';
import NotificationScreen from './src/screens/profile/NotificationsScreen';
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";

// import Main from "./component/main";
// import Home from "./component/Home";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        safeAreaInsets: { top: 0 },
        drawerType: 'slide',
        drawerStyle: {
          width: 260,
        },
        sceneContainerStyle: {
          borderRadius: 20,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={BottomTabNavigator} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="MyListings" component={MyListingsScreen} />
      <Drawer.Screen name="MyBookings" component={MyBookingsScreen} />
      <Drawer.Screen name="UserBooked" component={UserBookedScreen} />
      <Drawer.Screen name="Earnings" component={EarningsScreen} />
      <Drawer.Screen name="AddListing" component={AddListingScreen} />
      <Drawer.Screen name="EditListing" component={EditListingScreen} />
      <Drawer.Screen name="RoomDetails" component={RoomDetails} />
      <Drawer.Screen name="VehicleDetails" component={VehicleDetails} />
      <Drawer.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Drawer.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Drawer.Screen name="Notifications" component={NotificationScreen} />
    </Drawer.Navigator>
  );
}

// if you want to add a new screen,temporary placeholder screen
function PlaceholderScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Coming Soon!</Text>
    </View>
  );
}

export default function App() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#FFFFFF'
            },
            safeAreaInsets: { top: 0 ,bottom:0},
          }}
        >
          {!hasSeenOnboarding ? (
            // Onboarding Stack
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen}
              initialParams={{ onComplete: handleOnboardingComplete }}
            />
          ) : !isAuthenticated ? (
            <>
              <Stack.Screen 
                name="Login" 
                component={Login}
                initialParams={{ setIsAuthenticated }}
              />
              <Stack.Screen 
                name="Signup" 
                component={SignUp}
                initialParams={{ setIsAuthenticated }}
              />
              <Stack.Screen 
                name="ForgotPasswordScreen" 
                component={ForgotPasswordScreen}
              />
            </>
          ) : (
            <Stack.Screen 
              name="MainDrawer" 
              component={MainDrawer}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}