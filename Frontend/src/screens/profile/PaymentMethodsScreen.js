import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPaymentMethods, addPaymentMethod, deletePaymentMethod } from '../../utils/api';

const PaymentMethodCard = ({ method, onDelete }) => (
  <View style={styles.cardContainer}>
    <View style={styles.cardHeader}>
      <View style={styles.cardType}>
        <Ionicons name="card" size={24} color="#007AFF" />
        <Text style={styles.cardTypeText}>{method.type}</Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(method)}>
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
    <Text style={styles.cardNumber}>**** **** **** {method.cardNumber.slice(-4)}</Text>
    <Text style={styles.cardExpiry}>Expires {method.expiryMonth}/{method.expiryYear}</Text>
  </View>
);

const PaymentMethodsScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await getPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || 
          !formData.cvv || !formData.cardholderName) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const newMethod = await addPaymentMethod(formData);
      setPaymentMethods([...paymentMethods, newMethod]);
      setShowAddForm(false);
      setFormData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
      });
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add payment method');
    }
  };

  const handleDeletePaymentMethod = async (method) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(method._id);
              setPaymentMethods(paymentMethods.filter(m => m._id !== method._id));
              Alert.alert('Success', 'Payment method deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete payment method');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
      </View>

      <ScrollView style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchPaymentMethods}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : showAddForm ? (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              value={formData.cardNumber}
              onChangeText={(value) => setFormData({ ...formData, cardNumber: value.replace(/\D/g, '').slice(0, 16) })}
              keyboardType="numeric"
              maxLength={16}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="MM"
                value={formData.expiryMonth}
                onChangeText={(value) => setFormData({ ...formData, expiryMonth: value.replace(/\D/g, '').slice(0, 2) })}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginHorizontal: 8 }]}
                placeholder="YY"
                value={formData.expiryYear}
                onChangeText={(value) => setFormData({ ...formData, expiryYear: value.replace(/\D/g, '').slice(0, 2) })}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                placeholder="CVV"
                value={formData.cvv}
                onChangeText={(value) => setFormData({ ...formData, cvv: value.replace(/\D/g, '').slice(0, 3) })}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cardholder Name"
              value={formData.cardholderName}
              onChangeText={(value) => setFormData({ ...formData, cardholderName: value })}
              autoCapitalize="words"
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleAddPaymentMethod}
              >
                <Text style={styles.submitButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {paymentMethods.length > 0 ? (
              paymentMethods.map(method => (
                <PaymentMethodCard
                  key={method._id}
                  method={method}
                  onDelete={handleDeletePaymentMethod}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="card-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No payment methods</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cardContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTypeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  formContainer: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default PaymentMethodsScreen; 