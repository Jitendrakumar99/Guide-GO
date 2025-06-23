import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ListingCard = ({ title, type, price, status, onPress, onEdit, onDelete, onToggleStatus, id }) => (
  <TouchableOpacity style={styles.listingCard} onPress={onPress}>
    <View style={styles.listingContent}>
      <Text style={styles.listingTitle}>{title}</Text>
      <View style={styles.listingDetails}>
        <View style={styles.listingType}>
          <Ionicons 
            name={type === 'room' ? 'bed' : 'car'} 
            size={16} 
            color="#007AFF" 
          />
          <Text style={styles.typeText}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </View>
        <Text style={styles.listingPrice}>${price}/day</Text>
      </View>
      <View style={styles.listingActions}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: status === 'published' ? '#E8F5E9' : '#FFEBEE' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: status === 'published' ? '#2E7D32' : '#C62828' }
          ]}>
            {status === 'published' ? 'Published' : 'Draft'}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => onEdit(id)}
          >
            <Ionicons name="pencil" size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.toggleButton]} 
            onPress={() => onToggleStatus(id, status === 'published' ? 'draft' : 'published')}
          >
            <Ionicons 
              name={status === 'published' ? 'eye-off' : 'eye'} 
              size={16} 
              color={status === 'published' ? '#C62828' : '#2E7D32'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => onDelete(id)}
          >
            <Ionicons name="trash" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  listingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  listingContent: {
    flex: 1,
    padding: 15,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 5,
    color: '#007AFF',
  },
  listingPrice: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  toggleButton: {
    backgroundColor: '#F1F8E9',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
});

export default ListingCard; 