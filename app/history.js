import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const historyData = [
  { id: '1', date: '23 June 2026', disease: 'Dermatitis', status: 'Verified' },
  { id: '2', date: '21 June 2026', disease: 'Eczema', status: 'Verified' },
  { id: '3', date: '19 July 2026', disease: 'Scanning...', status: 'Pending' },
];

export default function History() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/result-detail?id=${item.id}`)}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <Ionicons name="medical-outline" size={24} color="#3b82f6" />
        </View>
        <View>
          <Text style={styles.disease}>{item.disease}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
      
      <View style={[styles.badge, { backgroundColor: item.status === 'Verified' ? '#dcfce7' : '#fef3c7' }]}>
        <Text style={[styles.badgeText, { color: item.status === 'Verified' ? '#166534' : '#92400e' }]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SCANNING HISTORY</Text>
      </View>

      {/* List */}
      <FlatList 
        data={historyData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listPadding}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginLeft: 15 },
  listPadding: { padding: 20 },
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { backgroundColor: '#eff6ff', padding: 10, borderRadius: 12, marginRight: 15 },
  disease: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  date: { fontSize: 12, color: '#64748b', marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' }
});