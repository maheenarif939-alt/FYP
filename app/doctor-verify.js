import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function DoctorVerify() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Case</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={require('../assets/images/placeholder-face.png')} style={styles.faceImage} />

        <View style={styles.card}>
          <Text style={styles.label}>Diagnosed Disease:</Text>
          <Text style={styles.value}>Eczema</Text>

          <Text style={styles.label}>Suggested Medicine:</Text>
          <Text style={styles.blueText}>Hydrocortisone Cream 1%</Text>

          <Text style={styles.label}>Doctor's Note:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Write notes here..." 
            multiline 
          />
        </View>

        <TouchableOpacity style={styles.approveButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Approve Case</Text>
        </TouchableOpacity>
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
  faceImage: { width: '100%', height: 250, borderRadius: 20, marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  label: { fontSize: 12, color: '#64748b', marginBottom: 5 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  blueText: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6', marginBottom: 15 }, // Yahan blue color diya hai
  input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 15, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0' },
  approveButton: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 20, alignItems: 'center' }, // Project ka button color
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});