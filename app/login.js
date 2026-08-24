import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const [isDoctor, setIsDoctor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();

  const handleLogin = () => {
    // Ye check karega agar doctor toggle active hai to doctor-dashboard par jaye
    if (isDoctor) {
      router.replace('/doctor-dashboard'); 
    } else {
      router.replace('/dashboard'); 
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

        {/* Login Button */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
            <Text style={styles.btnText}>Login as {isDoctor ? 'Doctor' : 'Patient'}</Text>
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
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#3b82f6', paddingRight: 10 },
  passwordInput: { flex: 1, padding: 15, color: '#3b82f6', fontWeight: '500' },
  loginBtn: { height: 55, borderRadius: 27.5, marginTop: 10, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 25, color: '#3b82f6' }
});