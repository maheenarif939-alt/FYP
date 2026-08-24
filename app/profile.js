import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const router = useRouter();

  const handleLogout = () => {
    // Yahan aap apna authentication clear karne ka logic likhengi
    // Abhi ke liye hum simple navigation use kar rahe hain
    router.replace('/login'); 
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY PROFILE</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#3b82f6" />
        </View>
        <Text style={styles.userName}>Eman Fatima</Text>
        <Text style={styles.userEmail}>eman.fatima@example.com</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
        </View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionBtn}>
          <Ionicons name="person-outline" size={22} color="#3b82f6" />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionBtn}>
          <Ionicons name="settings-outline" size={22} color="#3b82f6" />
          <Text style={styles.optionText}>Settings</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.optionBtn, styles.logoutBtn]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={[styles.optionText, { color: '#ef4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginLeft: 15 },
  profileCard: { backgroundColor: '#fff', margin: 20, padding: 25, borderRadius: 25, alignItems: 'center', elevation: 5 },
  avatarContainer: { marginBottom: 10 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  userEmail: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 20 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6' },
  statLabel: { fontSize: 12, color: '#64748b' },
  statDivider: { width: 1, backgroundColor: '#e2e8f0' },
  optionsContainer: { paddingHorizontal: 20 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 12, elevation: 2 },
  optionText: { marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#1e293b' },
  logoutBtn: { backgroundColor: '#fff', marginTop: 10 } // Red border/text sirf visual styling ke liye
});