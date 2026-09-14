import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCaseDetail, getMyCases } from '../api/client';

// tracker steps
const STEP_ORDER = ['uploaded', 'payment_pending', 'processing', 'doctor_pending', 'approved'];

export default function CaseTracking() {
  const router = useRouter();
  const { caseId } = useLocalSearchParams();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const previousStatusRef = useRef(null);

  const loadCase = useCallback(async () => {
    try {
      let data = null;

      if (caseId) {
        // Opened with upload/payment
        data = await getCaseDetail(caseId);
      } else {
        // Opened from dashboard
        const cases = await getMyCases();
        if (Array.isArray(cases) && cases.length > 0) {
          data = cases[0];
        }
      }

      // notification bhej dein
      if (
        data &&
        data.status === 'approved' &&
        previousStatusRef.current !== 'approved' &&
        previousStatusRef.current !== null
      ) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Your Result is Ready!',
            body: 'A dermatologist has reviewed your case. Tap to view your result.',
          },
          trigger: null,
        });
      }
      previousStatusRef.current = data ? data.status : null;

      setCaseData(data);
    } catch (error) {
      console.log('Case load error:', error.message);
      setCaseData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [caseId]);

  useEffect(() => { loadCase(); }, [loadCase]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCase();
  };

  const currentStepIndex = caseData
    ? (caseData.status === 'rejected' ? STEP_ORDER.length - 1 : STEP_ORDER.indexOf(caseData.status))
    : -1;

  const isApproved = caseData?.status === 'approved';
  const isRejected = caseData?.status === 'rejected';
  const hasCase = !!caseData;

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Case Tracking</Text>
        </View>
        <Text style={styles.subHeader}>Pull down to refresh status</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Case Info Box */}
            {hasCase ? (
              <View style={styles.caseBox}>
                <View style={styles.caseHeader}>
                  <Text style={styles.caseId}>Case ID: #{caseData.case_number}</Text>
                  <View style={[styles.badge, isRejected && { backgroundColor: '#fee2e2' }, isApproved && { backgroundColor: '#dcfce7' }]}>
                    <Text style={[styles.badgeText, isApproved && { color: '#166534' }]}>{caseData.status_label}</Text>
                  </View>
                </View>
                <Text style={styles.caseMeta}>Submitted: {new Date(caseData.created_at).toLocaleString()}</Text>
                {!!caseData.disease_detected && (
                  <Text style={styles.caseMeta}>AI Detected: {caseData.disease_detected} ({Math.round((caseData.confidence || 0) * 100)}%)</Text>
                )}
              </View>
            ) : (
              <View style={styles.caseBox}>
                <Text style={styles.caseId}>No active case yet</Text>
                <Text style={styles.caseMeta}>Upload a photo to begin your first case. Your progress will appear below as it moves through each stage.</Text>
              </View>
            )}

            {/* Tracker Steps — always visible, active steps highlight as the case progresses */}
            <View style={styles.trackerContainer}>
              <StepItem icon="checkmark-circle" title="Image Uploaded" desc="Facial image saved securely to our database." active={currentStepIndex >= 0} showLine />
              <StepItem icon="cash" title="Payment Submitted" desc="Consultation fee received, awaiting AI analysis." active={currentStepIndex >= 1} showLine />
              <StepItem icon="flash" title="AI Analysis" desc="Our model is scanning the image for patterns." active={currentStepIndex >= 2} showLine />
              <StepItem icon="hourglass" title="Doctor Verification" desc="Final review by a certified dermatologist." active={currentStepIndex >= 3} showLine />
              <StepItem icon="document-text" title={isRejected ? 'Rejected' : 'Completed'} desc={isRejected ? 'The doctor did not approve this case.' : 'Your report will be ready to view here.'} active={currentStepIndex >= 4} showLine={false} />
            </View>

            {hasCase ? (
              <TouchableOpacity
                style={[styles.detectBtn, !isApproved && { opacity: 0.5 }]}
                onPress={() => router.push({ pathname: '/result', params: { id: caseData.id } })}
                disabled={!isApproved}
              >
                <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
                  <Text style={styles.btnText}>{isApproved ? 'Check Result' : 'Waiting for Doctor...'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.detectBtn} onPress={() => router.push('/uploadimage')}>
                <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
                  <Text style={styles.btnText}>Start Your First Case</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}>
          <Ionicons name="home" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/payment')}>
          <Ionicons name="card" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.centerBtn} onPress={() => router.push('/uploadimage')}>
          <Ionicons name="camera" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/casetracking')}>
          <Ionicons name="analytics" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Tracking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/doctor')}>
          <Ionicons name="person-circle" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Doctor</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const StepItem = ({ icon, title, desc, active, showLine }) => (
  <View style={styles.stepRow}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color={active ? '#3b82f6' : '#94a3b8'} />
      {showLine && <View style={styles.verticalLine} />}
    </View>
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: active ? '#3b82f6' : '#94a3b8' }]}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 150 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#3b82f6' },
  subHeader: { color: '#64748b', marginBottom: 20 },
  caseBox: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 20, elevation: 3 },
  caseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  caseId: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  badge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#e11d48', fontSize: 12, fontWeight: '600' },
  caseMeta: { color: '#64748b', fontSize: 13, marginTop: 4 },
  trackerContainer: { backgroundColor: '#fff', padding: 25, borderRadius: 20, marginBottom: 20 },
  stepRow: { flexDirection: 'row', marginBottom: 25 },
  iconContainer: { alignItems: 'center', marginRight: 15 },
  verticalLine: { width: 2, height: 45, backgroundColor: '#e2e8f0', marginTop: 5 },
  stepContent: { flex: 1 },
  stepTitle: { fontWeight: 'bold', fontSize: 15 },
  stepDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  detectBtn: { height: 55, borderRadius: 27.5, marginTop: 10, overflow: 'hidden', elevation: 5 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 15, paddingBottom: 20, position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 10, borderTopWidth: 1, borderColor: '#e2e8f0' },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  centerBtn: { backgroundColor: '#8b5cf6', padding: 16, borderRadius: 35, marginTop: -50, elevation: 8, shadowColor: '#8b5cf6', shadowOpacity: 0.4, shadowRadius: 10 }
});