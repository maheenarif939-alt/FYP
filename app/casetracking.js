import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CaseTracking() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Case Tracking</Text>
        </View>
        <Text style={styles.subHeader}>Track the live verification progress of your case</Text>

        {/* Case Info Box */}
        <View style={styles.caseBox}>
          <View style={styles.caseHeader}>
            <Text style={styles.caseId}>Case ID: #DCA-9081</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>Processing</Text></View>
          </View>
          <Text style={styles.caseMeta}>Submitted: Just now</Text>
          <Text style={styles.caseMeta}>Type: Facial Skin Analysis</Text>
        </View>

        {/* Tracker Steps */}
        <View style={styles.trackerContainer}>
          <StepItem icon="checkmark-circle" color="#22c55e" title="Image Uploaded" desc="Facial image saved secure in database." active={true} showLine={true} />
          <StepItem icon="checkmark-circle" color="#22c55e" title="Payment Verified" desc="Fee received successfully via JazzCash." active={true} showLine={true} />
          <StepItem icon="flash" color="#3b82f6" title="AI Analysis Running" desc="Deep learning model scanning for patterns." active={true} showLine={true} />
          <StepItem icon="hourglass" color="#94a3b8" title="Doctor Verification" desc="Final review by a certified dermatologist." active={true} showLine={true} />
          <StepItem icon="document-text" color="#94a3b8" title="Completed" desc="Your report is ready to view." active={false} showLine={false} />
        </View>

        {/* Updated Button with Gradient */}
        <TouchableOpacity style={styles.detectBtn} onPress={() => router.push('/result')}>
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
            <Text style={styles.btnText}>Check Result</Text>
          </LinearGradient>
        </TouchableOpacity>
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

const StepItem = ({ icon, color, title, desc, active, showLine }) => (
  <View style={styles.stepRow}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color={color} />
      {showLine && <View style={styles.verticalLine} />}
    </View>
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, {color: active ? '#3b82f6' : '#94a3b8'}]}>{title}</Text>
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
  caseMeta: { color: '#64748b', fontSize: 13 },
  trackerContainer: { backgroundColor: '#fff', padding: 25, borderRadius: 20, marginBottom: 20 },
  stepRow: { flexDirection: 'row', marginBottom: 25 },
  iconContainer: { alignItems: 'center', marginRight: 15 },
  verticalLine: { width: 2, height: 45, backgroundColor: '#e2e8f0', marginTop: 5 },
  stepContent: { flex: 1 },
  stepTitle: { fontWeight: 'bold', fontSize: 15 },
  stepDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  // Updated Button Styles
  detectBtn: { height: 55, borderRadius: 27.5, marginTop: 10, overflow: 'hidden', elevation: 5 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Footer
  footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 15, paddingBottom: 20, position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 10, borderTopWidth: 1, borderColor: '#e2e8f0' },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  centerBtn: { backgroundColor: '#8b5cf6', padding: 16, borderRadius: 35, marginTop: -50, elevation: 8, shadowColor: '#8b5cf6', shadowOpacity: 0.4, shadowRadius: 10 }
});