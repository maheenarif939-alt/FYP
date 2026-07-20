import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DoctorProfile() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: 'https://img.freepik.com/free-photo/friendly-doctor-smiling-camera_23-2148148633.jpg' }} 
            style={styles.avatar} 
          />
          <Text style={styles.docName}>Dr. Sarah Ahmed</Text>
          <Text style={styles.docSpecialty}>Senior Dermatologist</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#3b82f6" />
            <Text style={styles.ratingText}>4.9 (120 Reviews)</Text>
          </View>
        </View>

        {/* Info Details */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow icon="mail" label="Email" value="dr.sarah@dermacare.com" />
          <InfoRow icon="call" label="Phone" value="+92 300 1234567" />
          <InfoRow icon="location" label="Clinic" value="Dermatology Center, Lahore" />
        </View>

        {/* About Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Dr. Sarah is a certified dermatologist with over 10 years of experience in skin analysis and treatment. 
            She specializes in AI-assisted diagnosis and patient care.
          </Text>
        </View>
      </ScrollView>

      {/* Footer (Same as Dashboard) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}>
          <Ionicons name="home" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/payment')}>
          <Ionicons name="card" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.centerBtn} onPress={() => router.push('/uploadimage')}>
          <Ionicons name="camera" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/casetracking')}>
          <Ionicons name="analytics" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-circle" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Doctor</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconBox}><Ionicons name={icon} size={20} color="#fff" /></View>
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 150 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#3b82f6' },
  profileCard: { backgroundColor: '#fff', padding: 30, borderRadius: 25, alignItems: 'center', elevation: 4, marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15, borderWidth: 3, borderColor: '#e0e7ff' },
  docName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  docSpecialty: { color: '#3b82f6', marginBottom: 5, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  ratingText: { marginLeft: 5, color: '#3b82f6', fontWeight: 'bold' },
  infoSection: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#3b82f6' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 15, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  label: { fontSize: 12, color: '#64748b' },
  value: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  aboutText: { color: '#475569', lineHeight: 22 },
  
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingVertical: 15, 
    paddingBottom: 20,
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    borderTopWidth: 1, 
    borderColor: '#e2e8f0',
    elevation: 10
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  centerBtn: { 
    backgroundColor: '#8b5cf6', 
    padding: 16, 
    borderRadius: 35, 
    marginTop: -50, 
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 10 
  }
});