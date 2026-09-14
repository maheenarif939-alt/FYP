import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getPendingCases } from '../api/client';

export default function PendingCases() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCases = useCallback(async () => {
    try {
      const data = await getPendingCases();
      setCases(data);
    } catch (error) {
      console.log('Pending cases error:', error.message);
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
        <Text style={styles.headerTitle}>Pending Cases</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        ) : cases.length === 0 ? (
          <Text style={styles.emptyText}>No cases are currently pending.</Text>
        ) : (
          cases.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/doctor-verify', params: { id: item.id } })}>
              <View style={styles.iconContainer}>
                <Ionicons name="person" size={24} color="#3b82f6" />
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{item.patient?.full_name || 'Patient'}</Text>
                <Text style={styles.issue}>{item.disease_detected || 'Analysis pending'} · #{item.case_number}</Text>
              </View>

              <View style={styles.statusBox}>
                <Text style={styles.statusText}>Pending</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
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
  statusBox: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 10 },
  statusText: { color: '#ef4444', fontSize: 10, fontWeight: 'bold' }
});