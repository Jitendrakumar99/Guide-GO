import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  HomeStack,
  TourStack,
  RoomStack,
  VehicleStack,
  ProfileStack
} from './StackNavigators';

const Tab = createBottomTabNavigator();

function HamburgerMenu() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      style={{
        marginLeft: 10,
        marginRight: 8,
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="menu" size={32} color="#007AFF" />
    </TouchableOpacity>
  );
}

function HeaderTitle() {
  return (
    <Text
      style={{
        fontSize: 22,
        fontWeight: 'bold',
        color: '#007AFF',
        marginLeft: 6,
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-medium',
        letterSpacing: 1,
        textShadowColor: '#E0E7FF',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }}
    >
      The Guide&Go
    </Text>
  );
}

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Define icons for each route
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tours':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Rooms':
              iconName = focused ? 'bed' : 'bed-outline';
              break;
            case 'Vehicles':
              iconName = focused ? 'car' : 'car-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          // Ensure minimum size for better visibility
          const iconSize = Platform.OS === 'ios' ? size : size + 2;

          return (
            <Ionicons 
              name={iconName} 
              size={iconSize} 
              color={color}
              style={{ marginBottom: Platform.OS === 'ios' ? 0 : -3 }}
            />
          );
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerLeft: () => <HamburgerMenu />, 
        headerTitle: () => <HeaderTitle />, 
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 60,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Tours" 
        component={TourStack}
        options={{
          tabBarLabel: 'Tours',
        }}
      />
      <Tab.Screen 
        name="Rooms" 
        component={RoomStack}
        options={{
          tabBarLabel: 'Rooms',
        }}
      />
      <Tab.Screen 
        name="Vehicles" 
        component={VehicleStack}
        options={{
          tabBarLabel: 'Vehicles',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator; 