import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginUser, setSession, clearSession } from '../api/client';

export default function Login() {
  const [isDoctor, setIsDoctor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Enter vaild Email or password.');
      return;
    }

    const requestedRole = isDoctor ? 'doctor' : 'patient';

    setLoading(true);
    try {
      const data = await loginUser({
        email: email.trim(),
        password,
        role: requestedRole,
      });

      // Safety check: agar kisi wajah se account ka role
      // requested role se match nahi karta, to session save hi na karo
      // aur ghalat dashboard kabhi na khulne do.
      if (data.user.role !== requestedRole) {
        await clearSession();
        Alert.alert(
          'Account Mismatch',
          isDoctor
            ? 'This account is not registered as a Doctor. Please switch to Patient login.'
            : 'This account is not registered as a Patient. Please switch to Doctor login.'
        );
        return;
      }

      // Login kaamyab — session (tokens + user) save karein
      await setSession(data.tokens, data.user);

      if (data.user.role === 'doctor') {
        router.replace('/doctor-dashboard');
      } else {
        router.replace('/dashboard');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>

        {/* Logo */}
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity style={[styles.toggleBtn, !isDoctor && styles.activeBtn]} onPress={() => setIsDoctor(false)}>
            <Text style={!isDoctor ? styles.activeText : styles.inactiveText}>Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, isDoctor && styles.activeBtn]} onPress={() => setIsDoctor(true)}>
            <Text style={isDoctor ? styles.activeText : styles.inactiveText}>Doctor</Text>
          </TouchableOpacity>
        </View>

        {/* Email Field */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#3b82f6"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password Field */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#3b82f6"
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{padding: 5}}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/forgot-password', params: { role: isDoctor ? 'doctor' : 'patient' } })}
          style={styles.forgotLink}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Login as {isDoctor ? 'Doctor' : 'Patient'}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Signup - Only for Patients */}
        {!isDoctor && (
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.footerText}>Don't have an account? <Text style={{fontWeight: 'bold', color: '#3b82f6'}}>Sign Up</Text></Text>
          </TouchableOpacity>
        )}

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 25 },
  logo: { width: 160, height: 160, alignSelf: 'center', marginBottom: 30, resizeMode: 'contain' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8, marginLeft: 5 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 25, padding: 5, marginBottom: 25 },
  toggleBtn: { flex: 1, padding: 12, borderRadius: 20, alignItems: 'center' },
  activeBtn: { backgroundColor: '#ffffff', elevation: 3 },
  activeText: { fontWeight: 'bold', color: '#3b82f6' },
  inactiveText: { color: '#64748b' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#3b82f6', color: '#3b82f6', fontWeight: '500' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, marginBottom: 8, borderWidth: 1, borderColor: '#3b82f6', paddingRight: 10 },
  passwordInput: { flex: 1, padding: 15, color: '#3b82f6', fontWeight: '500' },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#3b82f6', fontSize: 13, fontWeight: '600' },
  loginBtn: { height: 55, borderRadius: 27.5, marginTop: 10, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 25, color: '#3b82f6' }
});