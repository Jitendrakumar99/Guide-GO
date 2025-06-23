import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, markNotificationAsRead } from '../../utils/api';

const NotificationItem = ({ notification, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.notificationItem,
      !notification.read && styles.unreadNotification
    ]} 
    onPress={() => onPress(notification)}
  >
    <View style={styles.notificationIcon}>
      <Ionicons 
        name={getNotificationIcon(notification.type)} 
        size={24} 
        color="#007AFF" 
      />
    </View>
    <View style={styles.notificationContent}>
      <Text style={styles.notificationTitle}>{notification.title}</Text>
      <Text style={styles.notificationMessage}>{notification.message}</Text>
      <Text style={styles.notificationTime}>
        {formatTime(notification.createdAt)}
      </Text>
    </View>
  </TouchableOpacity>
);

const getNotificationIcon = (type) => {
  switch (type) {
    case 'booking':
      return 'calendar';
    case 'payment':
      return 'card';
    case 'message':
      return 'chatbubble';
    case 'system':
      return 'information-circle';
    default:
      return 'notifications';
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return diffInHours === 0 
      ? 'Just now'
      : `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, read: true } : n
        ));
      }

      // Handle navigation based on notification type
      switch (notification.type) {
        case 'booking':
          navigation.navigate('MyBookings');
          break;
        case 'payment':
          navigation.navigate('PaymentMethods');
          break;
        case 'message':
          // Navigate to chat or message screen
          break;
        default:
          // No navigation for system notifications
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchNotifications}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchNotifications}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onPress={handleNotificationPress}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              You'll be notified about bookings, payments, and important updates
            </Text>
          </View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default NotificationsScreen; 