import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { resendVerification, setSession, verifyEmail } from '../api/client';

export default function VerifyEmail() {
  const router = useRouter();
  const { email, role } = useLocalSearchParams();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Missing Code', 'Please enter the 6-digit code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyEmail({ email, role, code: code.trim() });
      await setSession(data.tokens, data.user);
      Alert.alert('Success', 'Your email has been verified!');
      router.replace(role === 'doctor' ? '/doctor-dashboard' : '/dashboard');
    } catch (error) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification({ email, role });
      Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setResending(false);
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
            <Text style={styles.headerTitle}>Verify Email</Text>
            <Text style={styles.subText}>
              We've sent a 6-digit verification code to{'\n'}
              <Text style={{ fontWeight: 'bold', color: '#3b82f6' }}>{email}</Text>
            </Text>
          </View>

          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            placeholder="Enter 6-digit code"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
           
          <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
            <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Email</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.footerText}>
              {resending ? 'Resending...' : "Didn't receive a code? "}
              {!resending && <Text style={{ fontWeight: 'bold', color: '#3b82f6' }}>Resend</Text>}
            </Text>
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
  label: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8, marginLeft: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', color: '#3b82f6', fontWeight: '500', fontSize: 18, textAlign: 'center', letterSpacing: 4 },
  btn: { height: 55, borderRadius: 27.5, marginTop: 5, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 25, color: '#3b82f6' }
});