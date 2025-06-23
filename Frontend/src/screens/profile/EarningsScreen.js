import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBar from '../../components/StatusBar';
import { getUserEarnings } from '../../utils/api';

const EarningsScreen = ({ navigation }) => {
  const [earnings, setEarnings] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true);
      const data = await getUserEarnings();
      setEarnings(data);
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', error.message || 'Failed to fetch earnings');
    } finally {
      setEarningsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  if (earningsLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.listingsHeader}>
        <Text style={styles.listingsTitle}>My Earnings</Text>
        <TouchableOpacity onPress={fetchEarnings} style={styles.navButton}>
          <Text style={styles.navButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listingsContainer}>
          {earnings ? (
            <View style={styles.earningsSummary}>
              <View style={styles.earningsCard}>
                <Text style={styles.earningsLabel}>Total Earnings</Text>
                <Text style={styles.earningsAmount}>
                  ₹{(earnings.totalEarnings || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.earningsCard}>
                <Text style={styles.earningsLabel}>Completed Bookings</Text>
                <Text style={styles.earningsAmount}>
                  {earnings.completedBookings || 0}
                </Text>
              </View>
              <View style={styles.earningsCard}>
                <Text style={styles.earningsLabel}>Pending Payout</Text>
                <Text style={styles.earningsAmount}>
                  ₹{(earnings.pendingPayout || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.earningsCard}>
                <Text style={styles.earningsLabel}>Total Paid Out</Text>
                <Text style={styles.earningsAmount}>
                  ₹{(earnings.totalPayout || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noListingsContainer}>
              <Ionicons name="wallet-outline" size={48} color="#ccc" />
              <Text style={styles.noListingsText}>No earnings yet</Text>
              <Text style={styles.noListingsSubtext}>
                Your earnings will appear here once you start receiving bookings
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    color: '#007AFF',
    fontSize: 12,
  },
  listingsContainer: {
    padding: 20,
  },
  earningsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  noListingsContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  noListingsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  noListingsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
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
});

export default EarningsScreen; 