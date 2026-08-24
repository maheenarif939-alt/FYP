import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 1. Master List import ki
import { allCases } from '../data/cases';

export default function PendingCases() {
  const router = useRouter();

  // 2. Sirf 'pending' status walay cases filter ho kar aa jayenge
  const pendingCases = allCases.filter(item => item.status === 'pending');

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Cases</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {pendingCases.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card} 
            onPress={() => router.push('/doctor-verify')}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={24} color="#3b82f6" />
            </View>
            
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.issue}>{item.issue}</Text>
            </View>
            
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 60, paddingHorizontal: 20, marginBottom: 10 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', flex: 1 },
  scroll: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  iconContainer: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#dbeafe' },
  info: { marginLeft: 15, flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  issue: { color: '#64748b', fontSize: 12 },
  statusBox: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 10 },
  statusText: { color: '#ef4444', fontSize: 10, fontWeight: 'bold' }
});