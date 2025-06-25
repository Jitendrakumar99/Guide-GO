import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { requestPasswordResetOtp, verifyPasswordResetOtp, resetPassword } from '../../utils/api';

const passwordConstraints = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One digit', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const getPasswordStrength = (pw) => {
  let score = 0;
  passwordConstraints.forEach(c => { if (c.test(pw)) score++; });
  return score;
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleRequestOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await requestPasswordResetOtp(form.email);
      Alert.alert('OTP Sent', 'Check your email for the OTP.');
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await verifyPasswordResetOtp(form.email, form.otp);
      Alert.alert('OTP Verified', 'Now set your new password.');
      setStep(3);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Password constraints
    for (const c of passwordConstraints) {
      if (!c.test(form.password)) {
        setError('Password does not meet all requirements');
        return;
      }
    }
    setLoading(true);
    try {
      await resetPassword(form.email, form.password);
      Alert.alert('Password Reset', 'Your password has been reset. Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.password);
  const allValid = passwordStrength === passwordConstraints.length;
  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {step === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={form.otp}
            onChangeText={v => handleChange('otp', v)}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={form.password}
              onChangeText={v => handleChange('password', v)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.showHide}
              onPress={() => setShowPassword(s => !s)}
            >
              <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChangeText={v => handleChange('confirmPassword', v)}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.showHide}
              onPress={() => setShowConfirm(s => !s)}
            >
              <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>{showConfirm ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {/* Password strength bar */}
          <View style={styles.strengthBarContainer}>
            <View style={[styles.strengthBar, { backgroundColor: passwordStrength >= 1 ? '#ff4d4f' : '#eee' }]} />
            <View style={[styles.strengthBar, { backgroundColor: passwordStrength >= 2 ? '#ffb400' : '#eee' }]} />
            <View style={[styles.strengthBar, { backgroundColor: passwordStrength >= 3 ? '#ffe066' : '#eee' }]} />
            <View style={[styles.strengthBar, { backgroundColor: passwordStrength >= 4 ? '#6dd47e' : '#eee' }]} />
            <View style={[styles.strengthBar, { backgroundColor: passwordStrength === 5 ? '#007AFF' : '#eee' }]} />
          </View>

          {/* Password constraints checklist */}
          <View style={styles.constraintsList}>
            {passwordConstraints.map((c, i) => (
              <Text key={i} style={{ color: c.test(form.password) ? '#007AFF' : '#888', fontSize: 14 }}>
                {c.test(form.password) ? '✓' : '•'} {c.label}
              </Text>
            ))}
          </View>

          {/* Password match indicator */}
          {form.confirmPassword.length > 0 && (
            <Text style={{ color: passwordsMatch ? '#007AFF' : '#ff4d4f', marginBottom: 8 }}>
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </Text>
          )}

          <TouchableOpacity style={[styles.button, !allValid || !passwordsMatch && styles.buttonDisabled]} onPress={handleResetPassword} disabled={loading || !allValid || !passwordsMatch}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  error: { color: '#ff3b30', marginBottom: 15, textAlign: 'center' },
  showHide: { position: 'absolute', right: 15, top: 18, zIndex: 2 },
  strengthBarContainer: { flexDirection: 'row', marginBottom: 8, gap: 4 },
  strengthBar: { flex: 1, height: 6, borderRadius: 3 },
  constraintsList: { marginBottom: 8 },
});

export default ForgotPasswordScreen; 