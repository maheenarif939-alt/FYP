import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clearSession, getMyCases, getProfile } from '../api/client';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [totalScans, setTotalScans] = useState(0);
  const [verifiedScans, setVerifiedScans] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileData, cases] = await Promise.all([getProfile(), getMyCases()]);
        setProfile(profileData);
        setTotalScans(cases.length);
        setVerifiedScans(cases.filter((c) => c.status === 'approved').length);
      } catch (error) {
        console.log('Profile load error:', error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          router.replace('/login');
        },
      },
    ]);
  };

  const openAboutUs = () => {
    Alert.alert(
      'About Us',
      'DermaCare helps you get a quick AI-assisted skin analysis, followed by a review from a certified dermatologist.\n\nVersion 1.0.0'
    );
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY PROFILE</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color="#3b82f6" />
            </View>
            <Text style={styles.userName}>{profile?.full_name || 'Patient'}</Text>
            <Text style={styles.userEmail}>{profile?.email}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalScans}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{verifiedScans}</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionBtn} onPress={() => router.push('/history')}>
              <Ionicons name="time-outline" size={22} color="#3b82f6" />
              <Text style={styles.optionText}>Scan History</Text>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBtn} onPress={openAboutUs}>
              <Ionicons name="information-circle-outline" size={22} color="#3b82f6" />
              <Text style={styles.optionText}>About Us</Text>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, styles.logoutBtn]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text style={[styles.optionText, { color: '#ef4444' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#3b82f6', marginLeft: 15 },
  profileCard: { backgroundColor: '#fff', margin: 20, padding: 25, borderRadius: 25, alignItems: 'center', elevation: 5 },
  avatarContainer: { marginBottom: 10 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  userEmail: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 20 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6' },
  statLabel: { fontSize: 12, color: '#64748b' },
  statDivider: { width: 1, backgroundColor: '#e2e8f0' },
  optionsContainer: { paddingHorizontal: 20 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 12, elevation: 2 },
  optionText: { marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1 },
  chevron: { marginLeft: 'auto' },
  logoutBtn: { backgroundColor: '#fff', marginTop: 10 }
});