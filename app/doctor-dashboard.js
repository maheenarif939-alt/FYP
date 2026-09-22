import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllCases, getApprovedCases, getPendingCases, getProfile } from '../api/client';

const LAST_SEEN_KEY = 'doctor_last_seen_pending_count';

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState('');
  const [counts, setCounts] = useState({ pending: 0, approved: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNewCases, setHasNewCases] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profile, pending, approved, all] = await Promise.all([
        getProfile(),
        getPendingCases(),
        getApprovedCases(),
        getAllCases(),
      ]);
      setDoctorName(profile.full_name);
      setCounts({ pending: pending.length, approved: approved.length, all: all.length });

      const lastSeenRaw = await AsyncStorage.getItem(LAST_SEEN_KEY);
      const lastSeen = lastSeenRaw ? parseInt(lastSeenRaw, 10) : 0;
      setHasNewCases(pending.length > lastSeen);
    } catch (error) {
      console.log('Doctor dashboard load error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openPendingCases = async () => {
    await AsyncStorage.setItem(LAST_SEEN_KEY, String(counts.pending));
    setHasNewCases(false);
    router.push('/pending-cases');
  };

  const blocks = [
    { title: 'Pending Cases', desc: 'Waiting for your review', icon: 'hourglass-outline', count: counts.pending, color: '#f59e0b', bg: '#fef3c7', onPress: openPendingCases, showDot: hasNewCases },
    { title: 'Approved Cases', desc: 'Diagnosis sent to patients', icon: 'checkmark-done-outline', count: counts.approved, color: '#22c55e', bg: '#dcfce7', onPress: () => router.push('/approved-cases') },
    { title: 'All Cases', desc: 'Complete case history', icon: 'albums-outline', count: counts.all, color: '#3b82f6', bg: '#dbeafe', onPress: () => router.push('/all-cases') },
  ];

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header*/}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.profileSection} onPress={() => router.push('/doctor-account')}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logoSmall}
              resizeMode="contain"
            />
            <Text style={styles.doctorNameHeader} numberOfLines={1}>
              {loading ? 'Dr. ...' : `Dr. ${doctorName || 'Uqba'}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bellButton} onPress={openPendingCases}>
            <Ionicons name="notifications-outline" size={26} color="#3b82f6" />
            {hasNewCases && <View style={styles.headerDot} />}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        ) : (
          <>
            {hasNewCases && (
              <TouchableOpacity style={styles.notifyBanner} onPress={openPendingCases}>
                <Ionicons name="notifications" size={18} color="#fff" />
                <Text style={styles.notifyText}>
                  You have {counts.pending} case{counts.pending > 1 ? 's' : ''} awaiting review
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </TouchableOpacity>
            )}

            <Text style={styles.sectionLabel}>Case Management</Text>

            <View style={styles.blockList}>
              {blocks.map((item, index) => (
                <TouchableOpacity key={index} style={styles.bigBlock} onPress={item.onPress} activeOpacity={0.8}>
                  <View style={[styles.accentBar, { backgroundColor: item.color }]} />

                  <View style={styles.bigBlockContent}>
                    <View style={styles.bigBlockLeft}>
                      <View style={styles.iconWrapper}>
                        <View style={[styles.bigIcon, { backgroundColor: item.bg }]}>
                          <Ionicons name={item.icon} size={28} color={item.color} />
                        </View>
                        {item.showDot && <View style={styles.dot} />}
                      </View>
                      <View style={styles.bigBlockText}>
                        <Text style={styles.bigBlockTitle}>{item.title}</Text>
                        <Text style={styles.bigBlockDesc}>{item.desc}</Text>
                      </View>
                    </View>

                    <View style={styles.bigBlockRight}>
                      <View style={[styles.countCircle, { backgroundColor: item.bg }]}>
                        <Text style={[styles.countCircleText, { color: item.color }]}>{item.count}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={22} color="#cbd5e1" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 55, paddingBottom: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, },
  profileSection: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  logoSmall: { width: 60, height: 45 },
  doctorNameHeader: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', marginLeft: 12, flexShrink: 1 },
  bellButton: { position: 'relative', padding: 4 },
  headerDot: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#F8FBFF' },
  notifyBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', borderRadius: 16, padding: 14, marginBottom: 20, gap: 10, },
  notifyText: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 13 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 14, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  blockList: { gap: 18 },
  bigBlock: { backgroundColor: '#fff', borderRadius: 22, flexDirection: 'row', overflow: 'hidden', elevation: 4, shadowColor: '#3b82f6', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, },
  accentBar: { width: 6 },
  bigBlockContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  bigBlockLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrapper: { position: 'relative', marginRight: 16 },
  bigIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: 7, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#fff' },
  bigBlockText: { flex: 1 },
  bigBlockTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },
  bigBlockDesc: { fontSize: 12.5, color: '#64748b', marginTop: 3 },
  bigBlockRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countCircle: { minWidth: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  countCircleText: { fontWeight: 'bold', fontSize: 15 },
});