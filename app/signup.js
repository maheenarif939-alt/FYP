import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        
        {/* Header theme ke mutabiq blue kar diya */}
        <Text style={styles.header}>Create Account</Text>
        <Text style={styles.subHeader}>Sign up to start your AI skin analysis journey</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput placeholder="Enter your full name" placeholderTextColor="#3b82f6" style={styles.input} />

        <Text style={styles.label}>Email Address</Text>
        <TextInput placeholder="Enter your email" placeholderTextColor="#3b82f6" style={styles.input} keyboardType="email-address" />

        <Text style={styles.label}>Age</Text>
        <TextInput placeholder="Enter your age" placeholderTextColor="#3b82f6" style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput placeholder="Create password" placeholderTextColor="#3b82f6" secureTextEntry={!showPassword} style={styles.passwordInput} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{padding: 5}}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput placeholder="Confirm your password" placeholderTextColor="#3b82f6" secureTextEntry={!showConfirmPassword} style={styles.passwordInput} />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{padding: 5}}>
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/dashboard')}>
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
            <Text style={styles.btnText}>Register Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.footerText}>Already have an account? <Text style={{fontWeight: 'bold', color: '#3b82f6'}}>Login</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 25, paddingTop: 60 },
  logo: { width: 130, height: 130, alignSelf: 'center', marginBottom: 20, resizeMode: 'contain' },
  // Header ab blue color mein hai
  header: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', textAlign: 'center', marginBottom: 5 },
  subHeader: { fontSize: 14, color: '#3b82f6', textAlign: 'center', marginBottom: 30, opacity: 0.8 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8, marginLeft: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#3b82f6', color: '#3b82f6', fontWeight: '500' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#3b82f6', paddingRight: 10 },
  passwordInput: { flex: 1, padding: 15, color: '#3b82f6', fontWeight: '500' },
  btn: { height: 55, borderRadius: 27.5, marginTop: 10, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 25, color: '#3b82f6', marginBottom: 40 }
});