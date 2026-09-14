import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { forgotPassword, resetPassword } from '../api/client';

const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\';

const getPasswordChecks = (pwd) => ({
  length: pwd.length >= 8,
  uppercase: /[A-Z]/.test(pwd),
  number: /[0-9]/.test(pwd),
  special: [...pwd].some((c) => SPECIAL_CHARS.includes(c)),
});

const RuleRow = ({ passed, text }) => (
  <View style={styles.ruleRow}>
    <Ionicons name={passed ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={passed ? '#22c55e' : '#94a3b8'} />
    <Text style={[styles.ruleText, { color: passed ? '#22c55e' : '#94a3b8' }]}>{text}</Text>
  </View>
);

export default function ResetPassword() {
  const router = useRouter();
  const { email, role } = useLocalSearchParams();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const checks = getPasswordChecks(newPassword);
  const allChecksPassed = checks.length && checks.uppercase && checks.number && checks.special;

  const handleReset = async () => {
    if (!code.trim() || !newPassword || !confirmPassword) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
      return;
    }
    if (!allChecksPassed) {
      Alert.alert('Weak Password', 'Please make sure your password meets all the requirements below.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email, role,
        code: code.trim(),
        new_password: newPassword,
        new_password2: confirmPassword,
      });
      Alert.alert('Success', 'Your password has been reset. You can now log in.');
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await forgotPassword({ email, role });
      Alert.alert('Code Resent', 'A new reset code has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
          </View>

          <Text style={styles.subText}>
            Enter the 6-digit code sent to <Text style={{ fontWeight: 'bold' }}>{email}</Text> and choose a new password.
          </Text>

          <Text style={styles.label}>Reset Code</Text>
          <TextInput
            placeholder="Enter 6-digit code"
            placeholderTextColor="#3b82f6"
            style={styles.input}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />

          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Create a new password"
              placeholderTextColor="#3b82f6"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 5 }}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* Live password rules checklist */}
          <View style={styles.rulesBox}>
            <RuleRow passed={checks.length} text="At least 8 characters" />
            <RuleRow passed={checks.uppercase} text="One uppercase letter (A-Z)" />
            <RuleRow passed={checks.number} text="One number (0-9)" />
            <RuleRow passed={checks.special} text="One special character (!@#$%...)" />
          </View>

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            placeholder="Re-enter your new password"
            placeholderTextColor="#3b82f6"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.btn} onPress={handleReset} disabled={loading}>
            <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Reset Password</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} disabled={resending} style={{ marginTop: 20 }}>
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
  inner: { padding: 25, paddingTop: 60, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#3b82f6' },
  subText: { fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8, marginLeft: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#3b82f6', color: '#3b82f6', fontWeight: '500' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#3b82f6', paddingRight: 10 },
  passwordInput: { flex: 1, padding: 15, color: '#3b82f6', fontWeight: '500' },
  rulesBox: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: '#e2e8f0' },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  ruleText: { fontSize: 12, fontWeight: '600' },
  btn: { height: 55, borderRadius: 27.5, marginTop: 5, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', color: '#3b82f6' }
});