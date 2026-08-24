import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ResultDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SCAN RESULT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Uploaded Image */}
        <View style={styles.imgCard}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/300' }} 
            style={styles.resultImage} 
          />
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>VERIFIED BY DOCTOR</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Disease Detected:</Text>
            <Text style={styles.blueValue}>Eczema</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Confidence Score:</Text>
            <Text style={styles.blueValue}>92%</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Prescribed Medicine</Text>
          <Text style={styles.medText}>• Hydrocortisone Cream 1%</Text>
          <Text style={styles.medText}>• Cetirizine Tablet (if itching)</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Doctor's Note</Text>
          <Text style={styles.note}>
            "The detected condition appears to be mild eczema. Please maintain skin hydration and avoid triggers like harsh soaps. If redness increases, consult immediately."
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginLeft: 15 },
  scroll: { padding: 20, paddingBottom: 50 },
  imgCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20, elevation: 5 },
  resultImage: { width: '100%', height: 250 },
  statusBadge: { backgroundColor: '#dcfce7', padding: 10, alignItems: 'center' },
  statusText: { color: '#166534', fontWeight: 'bold', fontSize: 12 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 14, color: '#3b82f6', fontWeight: '600' }, // Yahan label ka color bhi blue kr diya
  blueValue: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6' }, // Blue color for values
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8 },
  medText: { fontSize: 14, color: '#1e293b', marginBottom: 5 },
  note: { fontSize: 14, color: '#475569', fontStyle: 'italic', lineHeight: 22 }
});