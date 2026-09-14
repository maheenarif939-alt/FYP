import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getApprovedCases } from '../api/client';

export default function ApprovedCases() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCases = useCallback(async () => {
    try {
      const data = await getApprovedCases();
      setCases(data);
    } catch (error) {
      console.log('Approved cases error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadCases(); }, [loadCases]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCases();
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approved Cases</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        ) : cases.length === 0 ? (
          <Text style={styles.emptyText}>No approved cases yet.</Text>
        ) : (
          cases.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              // Approved cases open the final result view, not the verify screen
              onPress={() => router.push({ pathname: '/result', params: { id: item.id } })}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="person" size={24} color="#3b82f6" />
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{item.patient?.full_name || 'Patient'}</Text>
                <Text style={styles.issue}>{item.disease_detected || 'N/A'} · #{item.case_number}</Text>
              </View>

              <View style={styles.statusBox}>
                <Text style={styles.statusText}>Approved</Text>
              </View>
              <Ionicons name="eye-outline" size={20} color="#3b82f6" />
            </TouchableOpacity>
          ))
        )}
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
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  iconContainer: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#dbeafe' },
  info: { marginLeft: 15, flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  issue: { color: '#64748b', fontSize: 12 },
  statusBox: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 8 },
  statusText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold' }
});