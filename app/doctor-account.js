import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DoctorAccount() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Account</Text>
      </View>

      <View style={styles.profileCard}>
        <Image 
          source={require('../assets/images/doctor-placeholder.png')} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>Dr. Eman Fatima</Text>
        <Text style={styles.specialty}>Senior Dermatologist</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#3b82f6" />
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>dr.eman@dermacare.com</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#3b82f6" />
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>+92 300 1234567</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color="#3b82f6" />
            <Text style={styles.label}>Hospital:</Text>
            <Text style={styles.value}>City General Hospital</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="ribbon-outline" size={18} color="#3b82f6" />
            <Text style={styles.label}>Experience:</Text>
            <Text style={styles.value}>5 Years</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', marginLeft: 15 },
  profileCard: { backgroundColor: '#fff', marginHorizontal: 20, padding: 25, borderRadius: 25, alignItems: 'center', elevation: 5, borderWidth: 1, borderColor: '#e2e8f0' },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 15, borderWidth: 3, borderColor: '#3b82f6' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  specialty: { fontSize: 14, color: '#3b82f6', marginBottom: 20, fontWeight: '600' },
  infoContainer: { width: '100%', marginTop: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
  label: { fontSize: 13, color: '#64748b', marginLeft: 8, width: 80 },
  value: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1, textAlign: 'right' },
  logoutButton: { 
    flexDirection: 'row', 
    backgroundColor: '#ef4444', 
    marginHorizontal: 20, 
    marginTop: 25, 
    padding: 16, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 3
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});