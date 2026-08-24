import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DoctorDashboard() {
  const router = useRouter();

  const allCases = [
    { id: '1', name: 'Eman Fatima', status: 'pending', date: 'June 24, 2026' },
    { id: '2', name: 'Ali Khan', status: 'pending', date: 'June 23, 2026' },
    { id: '3', name: 'Sara Ahmed', status: 'approved', date: 'June 22, 2026' },
    { id: '4', name: 'Bilal Ahmed', status: 'pending', date: 'June 21, 2026' },
    { id: '5', name: 'Zoya Khan', status: 'approved', date: 'June 20, 2026' },
  ];

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        </View>

        <Text style={styles.welcomeText}>Hello, Doctor 👋</Text>

        {/* Clickable Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statBox} onPress={() => router.push('/all-cases')}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.count}>145</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => router.push('/pending-cases')}>
            <Text style={styles.label}>Pending</Text>
            <Text style={[styles.count, { color: '#ef4444' }]}>12</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => router.push('/approved-cases')}>
            <Text style={styles.label}>Approved</Text>
            <Text style={[styles.count, { color: '#22c55e' }]}>133</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Cases</Text>

        {allCases.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.caseCard} 
            onPress={() => router.push(item.status === 'pending' ? `/doctor-verify?id=${item.id}` : '/approved-cases')}
          >
            {/* Updated to Match Profile Icon Design */}
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={24} color="#3b82f6" />
            </View>
            
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[styles.status, { color: item.status === 'pending' ? '#ef4444' : '#22c55e' }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/pending-cases')}>
          <Ionicons name="list" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.centerBtn} onPress={() => router.push('/doctor-dashboard')}>
          <Ionicons name="home" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/doctor')}>
          <Ionicons name="person" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120 },
  header: { alignItems: 'center', marginTop: 50, marginBottom: 10 },
  logo: { width: 140, height: 140, resizeMode: 'contain' },
  welcomeText: { fontSize: 26, fontWeight: 'bold', marginVertical: 20, color: '#3b82f6', textAlign: 'center' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: '#fff', padding: 15, borderRadius: 20, width: '31%', alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6' },
  label: { color: '#1e293b', fontSize: 11, fontWeight: '600' },
  count: { fontSize: 20, fontWeight: 'bold', marginTop: 5, color: '#3b82f6' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6', marginBottom: 15 },
  // Updated caseCard style
  caseCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  iconContainer: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#dbeafe' },
  info: { marginLeft: 15, flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  status: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff', padding: 15, position: 'absolute', bottom: 0, width: '100%', borderTopWidth: 1, borderColor: '#e2e8f0' },
  centerBtn: { backgroundColor: '#3b82f6', padding: 20, borderRadius: 30, elevation: 5 },
  navText: { fontSize: 12, color: '#3b82f6', fontWeight: 'bold', marginTop: 4 },
  navItem: { alignItems: 'center' }
});