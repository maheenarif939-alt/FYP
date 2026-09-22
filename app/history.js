import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteCase, getMyCases } from '../api/client';

export default function History() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadCases = useCallback(async () => {
    try {
      const data = await getMyCases();
      setCases(data);
    } catch (error) {
      console.log('History load error:', error.message);
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

  //  Status logic 
  const getCaseState = (item) => {
    if (item.status === 'approved' && item.disease_detected) {
      return {
        key: 'completed',
        label: 'Completed',
        icon: 'checkmark-circle',
        color: '#166534',
        bg: '#dcfce7',
        iconColor: '#22c55e',
        subtitle: item.disease_detected,
      };
    }
    if (item.status === 'rejected') {
      return {
        key: 'rejected',
        label: 'Rejected',
        icon: 'close-circle',
        color: '#991b1b',
        bg: '#fee2e2',
        iconColor: '#ef4444',
        subtitle: 'Reviewed by doctor',
      };
    }
    if (item.status === 'uploaded') {
      return {
        key: 'unpaid',
        label: 'Payment Pending',
        icon: 'card-outline',
        color: '#92400e',
        bg: '#fef3c7',
        iconColor: '#f59e0b',
        subtitle: 'Tap to pay consultation fee',
      };
    }
    //  progress
    return {
      key: 'progress',
      label: 'In Progress',
      icon: 'time-outline',
      color: '#1d4ed8',
      bg: '#dbeafe',
      iconColor: '#3b82f6',
      subtitle: 'Waiting for review',
    };
  };

  const handlePress = (item) => {
    const state = getCaseState(item);
    if (state.key === 'completed') {
      router.push({ pathname: '/result', params: { id: item.id } });
    } else if (state.key === 'unpaid') {
      router.push({ pathname: '/payment', params: { caseId: item.id, caseNumber: item.case_number } });
    } else {
      router.push({ pathname: '/casetracking', params: { caseId: item.id } });
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item.id);
            try {
              await deleteCase(item.id);
              setCases((prev) => prev.filter((c) => c.id !== item.id));
            } catch (error) {
              Alert.alert('Failed to Delete', error.message);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const state = getCaseState(item);
    const isDeleting = deletingId === item.id;

    return (
      <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.7}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <View style={[styles.iconBox, { backgroundColor: state.bg }]}>
              <Ionicons name={state.icon} size={22} color={state.iconColor} />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.caseNumber}>Case #{item.case_number}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>{state.subtitle}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.cardBottom}>
          <View style={[styles.badge, { backgroundColor: state.bg }]}>
            <Text style={[styles.badgeText, { color: state.color }]}>{state.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SCANNING HISTORY</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : cases.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>Start your first skin analysis. </Text>
        </View>
      ) : (
        <FlatList
          data={cases}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listPadding}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#3b82f6', marginLeft: 15 },
  emptyBox: { alignItems: 'center', marginTop: 60, paddingHorizontal: 30 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 12, fontSize: 14 },
  listPadding: { padding: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 15, elevation: 4, shadowColor: '#3b82f6', shadowOpacity: 0.1, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, marginRight: 10 },
  iconBox: { padding: 10, borderRadius: 12, marginRight: 12 },
  textBlock: { flex: 1 },
  caseNumber: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#475569', marginTop: 2 },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  deleteButton: { padding: 6 },
  cardBottom: { flexDirection: 'row', marginTop: 12, paddingLeft: 46 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});