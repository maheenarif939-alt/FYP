import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { getCaseDetail } from '../api/client';

export default function ResultDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) { setLoading(false); return; }
      try {
        const data = await getCaseDetail(id);
        setCaseData(data);
      } catch (error) {
        console.log('Result load error:', error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const medicineLines = (caseData?.suggested_medicine || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SCAN RESULT</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : !caseData ? (
        <Text style={styles.emptyText}>No results found.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Uploaded Image */}
          <View style={styles.imgCard}>
            <Image
              source={{ uri: caseData.result_image || caseData.image }}
              style={styles.resultImage}
            />
            <View style={[styles.statusBadge, caseData.status !== 'approved' && { backgroundColor: '#fef9c3' }]}>
              <Text style={[styles.statusText, caseData.status !== 'approved' && { color: '#854d0e' }]}>
                {caseData.status === 'approved' ? 'VERIFIED BY DOCTOR' : caseData.status_label?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Disease Detected:</Text>
              <Text style={styles.blueValue}>{caseData.disease_detected || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Confidence Score:</Text>
              <Text style={styles.blueValue}>{Math.round((caseData.confidence || 0) * 100)}%</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Prescribed Medicine</Text>
            {medicineLines.length > 0 ? (
              medicineLines.map((line, i) => (
                <Text key={i} style={styles.medText}>• {line}</Text>
              ))
            ) : (
              <Text style={styles.medText}>The doctor has not yet confirmed the medicine.</Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Doctor's Note</Text>
            <Text style={styles.note}>
              {caseData.doctor_note || 'The doctor has not added the notes yet.'}
            </Text>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#3b82f6', marginLeft: 15 },
  scroll: { padding: 20, paddingBottom: 50 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 40 },
  imgCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20, elevation: 5 },
  resultImage: { width: '100%', height: 250 },
  statusBadge: { backgroundColor: '#dcfce7', padding: 10, alignItems: 'center' },
  statusText: { color: '#166534', fontWeight: 'bold', fontSize: 12 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  blueValue: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8 },
  medText: { fontSize: 14, color: '#1e293b', marginBottom: 5 },
  note: { fontSize: 14, color: '#475569', fontStyle: 'italic', lineHeight: 22 }
});
