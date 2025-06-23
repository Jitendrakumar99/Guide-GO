import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SupportItem = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.supportItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color="#007AFF" />
    </View>
    <View style={styles.contentContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#ccc" />
  </TouchableOpacity>
);

const HelpSupportScreen = ({ navigation }) => {
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleFAQ = () => {
    // Navigate to FAQ screen or open FAQ modal
    Alert.alert('Coming Soon', 'FAQ section will be available soon!');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy-policy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://example.com/terms-of-service');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <SupportItem
            icon="mail-outline"
            title="Email Support"
            description="Get help via email"
            onPress={handleEmailSupport}
          />
          <SupportItem
            icon="call-outline"
            title="Call Support"
            description="Speak with our support team"
            onPress={handleCallSupport}
          />
          <SupportItem
            icon="help-circle-outline"
            title="FAQ"
            description="Frequently asked questions"
            onPress={handleFAQ}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <SupportItem
            icon="shield-outline"
            title="Privacy Policy"
            description="Read our privacy policy"
            onPress={handlePrivacyPolicy}
          />
          <SupportItem
            icon="document-text-outline"
            title="Terms of Service"
            description="Read our terms of service"
            onPress={handleTermsOfService}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.copyrightText}>
              © 2024 Your Company Name. All rights reserved.
            </Text>
          </View>
        </View>
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
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  aboutContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default HelpSupportScreen; 