import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 1. Apni Master List import ki
import { allCases } from '../data/cases';

export default function AllCases() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Total Cases</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 2. Yahan direct allCases use ho raha hai */}
        {allCases.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card} 
            // 3. Logic: Sirf pending cases par click ho, approved par nahi
            onPress={() => item.status === 'pending' ? router.push(`/doctor-verify?id=${item.id}`) : null}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={24} color="#3b82f6" />
            </View>
            
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.issue}>{item.issue}</Text>
            </View>
            
            <Text style={styles.date}>{item.date}</Text>
            <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 60, 
    paddingHorizontal: 20,
    marginBottom: 10 
  },
  backButton: { marginRight: 15 },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#3b82f6',
    flex: 1 
  },
  scroll: { padding: 20 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  iconContainer: { 
    backgroundColor: '#eff6ff', 
    padding: 12, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#dbeafe'
  },
  info: { marginLeft: 15, flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  issue: { color: '#64748b', fontSize: 12 },
  date: { color: '#94a3b8', fontSize: 12, marginRight: 10 }
});