import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatusBar from '../../components/StatusBar';
import { requestOtp, verifyOtp, completeSignup } from '../../utils/api';

const Signup = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasDigit: false,
    hasSpecialChar: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update password strength when password changes
    if (field === 'password') {
      updatePasswordStrength(value);
    }
  };

  const updatePasswordStrength = (password) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    });
  };

  const getPasswordStrength = () => {
    const checks = Object.values(passwordStrength);
    const passedChecks = checks.filter(Boolean).length;
    
    if (passedChecks === 0) return { level: 'none', color: '#ccc', text: 'Very Weak' };
    if (passedChecks === 1) return { level: 'weak', color: '#ff3b30', text: 'Weak' };
    if (passedChecks === 2) return { level: 'fair', color: '#ff9500', text: 'Fair' };
    if (passedChecks === 3) return { level: 'good', color: '#ffcc00', text: 'Good' };
    if (passedChecks === 4) return { level: 'strong', color: '#34c759', text: 'Strong' };
    if (passedChecks === 5) return { level: 'very-strong', color: '#007AFF', text: 'Very Strong' };
  };

  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(Boolean);
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all fields');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.otp) {
      setError('Please enter the OTP sent to your email');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Please enter and confirm your password');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!isPasswordValid()) {
      setError('Password does not meet all requirements');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    setError(null);
    try {
      await requestOtp(formData.email);
      Alert.alert('OTP Sent', 'Check your email for the OTP.');
      setStep(2);
    } catch (e) {
      setError(e.message);
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateStep2()) return;
      setLoading(true);
      setError(null);
    try {
      await verifyOtp(formData.email, formData.otp);
      Alert.alert('OTP Verified', 'Now set your password.');
      setStep(3);
    } catch (e) {
      setError(e.message);
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    setError(null);
    try {
      await completeSignup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      Alert.alert('Signup Complete', 'Your account has been created. Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      setError(e.message);
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const PasswordStrengthIndicator = () => {
    const strength = getPasswordStrength();
    const checks = Object.values(passwordStrength);
    const passedChecks = checks.filter(Boolean).length;
    
    return (
      <View style={styles.passwordStrengthContainer}>
        <View style={styles.strengthBarContainer}>
          <View style={styles.strengthBar}>
            <View 
              style={[
                styles.strengthBarFill, 
                { 
                  width: `${(passedChecks / 5) * 100}%`,
                  backgroundColor: strength.color 
                }
              ]} 
            />
          </View>
          <Text style={[styles.strengthText, { color: strength.color }]}>
            {strength.text}
          </Text>
        </View>
        
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={passwordStrength.hasMinLength ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={passwordStrength.hasMinLength ? "#34c759" : "#ff3b30"} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.hasMinLength ? "#34c759" : "#ff3b30" }]}>
              At least 8 characters
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={passwordStrength.hasUppercase ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={passwordStrength.hasUppercase ? "#34c759" : "#ff3b30"} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.hasUppercase ? "#34c759" : "#ff3b30" }]}>
              At least one uppercase letter (A-Z)
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={passwordStrength.hasLowercase ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={passwordStrength.hasLowercase ? "#34c759" : "#ff3b30"} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.hasLowercase ? "#34c759" : "#ff3b30" }]}>
              At least one lowercase letter (a-z)
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={passwordStrength.hasDigit ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={passwordStrength.hasDigit ? "#34c759" : "#ff3b30"} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.hasDigit ? "#34c759" : "#ff3b30" }]}>
              At least one digit (0-9)
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={passwordStrength.hasSpecialChar ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={passwordStrength.hasSpecialChar ? "#34c759" : "#ff3b30"} 
            />
            <Text style={[styles.requirementText, { color: passwordStrength.hasSpecialChar ? "#34c759" : "#ff3b30" }]}>
              At least one special character (!@#$%^&*)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start your journey</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}

            {step === 1 && (
              <>
            <View style={styles.nameContainer}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="First Name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                autoCapitalize="words"
                autoComplete="given-name"
              />
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Last Name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                autoCapitalize="words"
                autoComplete="family-name"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
                <TouchableOpacity 
                  style={styles.signupButton}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.signupButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
            <TextInput
              style={styles.input}
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChangeText={(value) => handleInputChange('otp', value)}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.signupButton}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.signupButtonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
              autoComplete="password-new"
            />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
                <PasswordStrengthIndicator />
                <View style={styles.passwordInputContainer}>
            <TextInput
                    style={[styles.input, styles.passwordInput]}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
            />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
                {formData.confirmPassword.length > 0 && (
                  <View style={styles.confirmationIndicator}>
                    <Ionicons 
                      name={formData.password === formData.confirmPassword ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={formData.password === formData.confirmPassword ? "#34c759" : "#ff3b30"} 
                    />
                    <Text style={[
                      styles.confirmationText, 
                      { color: formData.password === formData.confirmPassword ? "#34c759" : "#ff3b30" }
                    ]}>
                      {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </Text>
                  </View>
                )}
            <TouchableOpacity 
                  style={[
                    styles.signupButton,
                    !isPasswordValid() && styles.signupButtonDisabled
                  ]}
                  onPress={handleCompleteSignup}
                  disabled={loading || !isPasswordValid()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                    <Text style={styles.signupButtonText}>Complete Signup</Text>
              )}
            </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  nameInput: {
    width: '48%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLinkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 15,
    textAlign: 'center',
  },
  passwordStrengthContainer: {
    marginBottom: 20,
  },
  strengthBarContainer: {
    marginBottom: 10,
  },
  strengthBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  requirementsContainer: {
    marginTop: 10,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 15,
  },
  signupButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmationText: {
    fontSize: 12,
    color: '#666',
  },
});

export default Signup;
