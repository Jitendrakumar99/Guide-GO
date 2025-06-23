import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../utils/auth';

const SettingItem = ({ icon, title, value, onPress, showSwitch, isEnabled, onToggle }) => (
  <TouchableOpacity 
    style={styles.settingItem} 
    onPress={onPress}
    disabled={showSwitch}
  >
    <View style={styles.settingLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#007AFF" />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
    </View>
    {showSwitch ? (
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: '#ddd', true: '#007AFF' }}
        thumbColor="#fff"
      />
    ) : (
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </View>
    )}
  </TouchableOpacity>
);

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    locationServices: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleLanguage = () => {
    Alert.alert('Coming Soon', 'Language selection will be available soon!');
  };

  const handleCurrency = () => {
    Alert.alert('Coming Soon', 'Currency selection will be available soon!');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            showSwitch
            isEnabled={settings.notifications}
            onToggle={() => handleToggle('notifications')}
          />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            showSwitch
            isEnabled={settings.darkMode}
            onToggle={() => handleToggle('darkMode')}
          />
          <SettingItem
            icon="location-outline"
            title="Location Services"
            showSwitch
            isEnabled={settings.locationServices}
            onToggle={() => handleToggle('locationServices')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon="mail-outline"
            title="Email Notifications"
            showSwitch
            isEnabled={settings.emailNotifications}
            onToggle={() => handleToggle('emailNotifications')}
          />
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            showSwitch
            isEnabled={settings.pushNotifications}
            onToggle={() => handleToggle('pushNotifications')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <SettingItem
            icon="language-outline"
            title="Language"
            value="English"
            onPress={handleLanguage}
          />
          <SettingItem
            icon="cash-outline"
            title="Currency"
            value="USD"
            onPress={handleCurrency}
          />
          <SettingItem
            icon="trash-outline"
            title="Clear Cache"
            onPress={handleClearCache}
          />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsScreen; 