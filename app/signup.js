import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { setSession, signupPatient } from '../api/client';

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

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();
  const checks = getPasswordChecks(password);
  const allChecksPassed = checks.length && checks.uppercase && checks.number && checks.special;

  const handleSignup = async () => {
    if (!fullName || !email || !age || !password || !confirmPassword) {
      Alert.alert('Missing Info', 'Please fill all the fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Please Enter the same.');
      return;
    }
    if (!allChecksPassed) {
      Alert.alert('Weak Password', 'Please make sure your password meets all the requirements shown below the password field.');
      return;
    }

    setLoading(true);
    try {
      const data = await signupPatient({
        full_name: fullName.trim(),
        email: email.trim(),
        age,
        password,
        password2: confirmPassword,
      });

      // Signup 
      setSession(data.tokens, data.user);
      router.replace('/dashboard');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        <Image source={require('../assets/images/logo.png')} style={styles.logo} />

        <Text style={styles.header}>Create Account</Text>
        <Text style={styles.subHeader}>Sign up to start your AI skin analysis journey</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          placeholder="Enter your full name"
          placeholderTextColor="#3b82f6"
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#3b82f6"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          placeholder="Enter your age"
          placeholderTextColor="#3b82f6"
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Create password"
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

        {/* Live password rules checklist */}
        <View style={styles.rulesBox}>
          <RuleRow passed={checks.length} text="At least 8 characters" />
          <RuleRow passed={checks.uppercase} text="One uppercase letter (A-Z)" />
          <RuleRow passed={checks.number} text="One number (0-9)" />
          <RuleRow passed={checks.special} text="One special character (!@#$%...)" />
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm your password"
            placeholderTextColor="#3b82f6"
            secureTextEntry={!showConfirmPassword}
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{padding: 5}}>
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Register Now</Text>
            )}
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
  header: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', textAlign: 'center', marginBottom: 5 },
  subHeader: { fontSize: 14, color: '#3b82f6', textAlign: 'center', marginBottom: 30, opacity: 0.8 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8, marginLeft: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#3b82f6', color: '#3b82f6', fontWeight: '500' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#3b82f6', paddingRight: 10 },
  passwordInput: { flex: 1, padding: 15, color: '#3b82f6', fontWeight: '500' },
  rulesBox: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: '#e2e8f0' },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  ruleText: { fontSize: 12, fontWeight: '600' },
  btn: { height: 55, borderRadius: 27.5, marginTop: 10, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 25, color: '#3b82f6', marginBottom: 40 }
});