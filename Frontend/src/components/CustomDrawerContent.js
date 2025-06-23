import React, { useEffect, useState } from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getUserById } from '../utils/api';

export default function CustomDrawerContent(props) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById();
        setUser(userData);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <TouchableOpacity style={styles.profileSection} onPress={() => props.navigation.navigate('Profile')}>
        <Image
          source={user?.profilePic ? { uri: user.profilePic } : require('../../assets/photo/08.png')}
          style={styles.profilePic}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
        </View>
      </TouchableOpacity>
      <DrawerItem
        label="Profile"
        icon={({ color, size }) => <Ionicons name="person" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Profile')}
      />
      <DrawerItem
        label="My Listings"
        icon={({ color, size }) => <Ionicons name="list" size={size} color={color} />}
        onPress={() => props.navigation.navigate('MyListings')}
      />
      <DrawerItem
        label="My Bookings"
        icon={({ color, size }) => <Ionicons name="calendar" size={size} color={color} />}
        onPress={() => props.navigation.navigate('MyBookings')}
      />
      <DrawerItem
        label="User Booked"
        icon={({ color, size }) => <Ionicons name="people" size={size} color={color} />}
        onPress={() => props.navigation.navigate('UserBooked')}
      />
      <DrawerItem
        label="Earnings"
        icon={({ color, size }) => <Ionicons name="wallet" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Earnings')}
      />
      <DrawerItem
        label="Notifications"
        icon={({ color, size }) => <Ionicons name="notifications" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Notifications')}
      />
      <DrawerItem
        label="Payment Methods"
        icon={({ color, size }) => <Ionicons name="card" size={size} color={color} />}
        onPress={() => props.navigation.navigate('PaymentMethods')}
      />
      <DrawerItem
        label="Help & Support"
        icon={({ color, size }) => <Ionicons name="help-circle" size={size} color={color} />}
        onPress={() => props.navigation.navigate('HelpSupport')}
      />
      <DrawerItem
        label="Settings"
        icon={({ color, size }) => <Ionicons name="settings" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Settings')}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  profilePic: {
    width: 50,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
}); 