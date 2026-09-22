import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { forgotPassword } from '../api/client';

export default function ForgotPassword() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isDoctor, setIsDoctor] = useState(params.role === 'doctor');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Info', 'Please enter your email address.');
      return;
    }
    const role = isDoctor ? 'doctor' : 'patient';

    setLoading(true);
    try {
      await forgotPassword({ email: email.trim(), role });
      Alert.alert('Check Your Email', 'If this email is registered, a 6-digit reset code has been sent to it.');
      router.push({ pathname: '/reset-password', params: { email: email.trim(), role } });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Forgot Password?</Text>
            <Text style={styles.subText}>
              Enter the email of your account and we'll send you a 6-digit code to reset your password.
            </Text>
          </View>

          {/* Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity style={[styles.toggleBtn, !isDoctor && styles.activeBtn]} onPress={() => setIsDoctor(false)}>
              <Text style={!isDoctor ? styles.activeText : styles.inactiveText}>Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, isDoctor && styles.activeBtn]} onPress={() => setIsDoctor(true)}>
              <Text style={isDoctor ? styles.activeText : styles.inactiveText}>Doctor</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.btn} onPress={handleSend} disabled={loading}>
            <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Code</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.footerText}>Remember your password? <Text style={{ fontWeight: 'bold', color: '#3b82f6' }}>Login</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 25, paddingTop: 55, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2, marginBottom: 24 },
  header: { marginBottom: 30 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8 },
  subText: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 25, padding: 5, marginBottom: 20 },
  toggleBtn: { flex: 1, padding: 12, borderRadius: 20, alignItems: 'center' },
  activeBtn: { backgroundColor: '#ffffff', elevation: 3 },
  activeText: { fontWeight: 'bold', color: '#3b82f6' },
  inactiveText: { color: '#64748b' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8, marginLeft: 5 },
  input: { backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1, 
    borderColor: '#e2e8f0', color: '#3b82f6', fontWeight: '500' },
  btn: { height: 55, borderRadius: 27.5, marginTop: 5, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 25, color: '#3b82f6' }
});