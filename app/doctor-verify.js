import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCaseDetail, verifyCase } from '../api/client';

export default function DoctorVerify() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [caseData, setCaseData] = useState(null);
  const [note, setNote] = useState('');
  const [medicine, setMedicine] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) { setLoading(false); return; }
      try {
        const data = await getCaseDetail(id);
        setCaseData(data);
        setMedicine(data.suggested_medicine || '');
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDecision = async (action) => {
    if (action === 'reject' && !note.trim()) {
      Alert.alert('Note Required', 'Please write a short note explaining why this scan needs a retake.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyCase(id, { action, doctor_note: note, medicine: action === 'approve' ? medicine : undefined });
      Alert.alert(
        'Success',
        action === 'approve' ? 'Case approved and medicine sent to the patient!' : 'Patient will be asked to retake the scan.'
      );
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confidencePct = Math.round((caseData?.confidence || 0) * 100);

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Case</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : !caseData ? (
        <Text style={styles.emptyText}>Case not found.</Text>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={{ uri: caseData.result_image || caseData.image }}
              style={styles.faceImage}
            />

            <View style={styles.card}>
              <Text style={styles.label}>Patient</Text>
              <Text style={styles.value}>{caseData.patient?.full_name}</Text>
              <Text style={styles.label}>Case Number</Text>
              <Text style={styles.value}>#{caseData.case_number}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="flash" size={18} color="#3b82f6" />
                <Text style={styles.sectionHeading}>AI Model Prediction</Text>
              </View>

              <Text style={styles.label}>Detected Condition</Text>
              <Text style={styles.diseaseText}>{caseData.disease_detected || 'N/A'}</Text>

              <View style={styles.confidenceRow}>
                <Text style={styles.label}>Confidence</Text>
                <View style={[styles.confidenceBadge, confidencePct >= 70 ? styles.confidenceHigh : styles.confidenceLow]}>
                  <Text style={[styles.confidenceText, confidencePct >= 70 ? { color: '#166534' } : { color: '#92400e' }]}>
                    {confidencePct}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="medkit" size={18} color="#3b82f6" />
                <Text style={styles.sectionHeading}>Suggested Medicine</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. Clindamycin gel 1%, twice daily"
                placeholderTextColor="#000000"
                value={medicine}
                onChangeText={setMedicine}
                autoCorrect={false}
                spellCheck={false}
              />
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="create-outline" size={18} color="#3b82f6" />
                <Text style={styles.sectionHeading}>Doctor Note</Text>
              </View>
              <TextInput
                style={styles.noteInput}
                placeholder="Note for the patient..."
                placeholderTextColor="#000000"
                multiline
                value={note}
                onChangeText={setNote}
                autoCorrect={false}
                spellCheck={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.approveButton, submitting && { opacity: 0.6 }]}
              onPress={() => handleDecision('approve')}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Approved</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rejectButton, submitting && { opacity: 0.6 }]}
              onPress={() => handleDecision('reject')}
              disabled={submitting}
            >
              <Ionicons name="camera-reverse-outline" size={20} color="#ef4444" />
              <Text style={styles.rejectButtonText}>Retake</Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 60, paddingHorizontal: 20, marginBottom: 10 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', flex: 1 },
  scroll: { padding: 20, paddingBottom: 60 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 40 },
  faceImage: { width: '100%', height: 250, borderRadius: 20, marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6' },
  label: { fontSize: 12, color: '#64748b', marginBottom: 5 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  diseaseText: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confidenceBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  confidenceHigh: { backgroundColor: '#dcfce7' },
  confidenceLow: { backgroundColor: '#fef3c7' },
  confidenceText: { fontWeight: 'bold', fontSize: 14 },
  input: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b', fontSize: 14 },
  noteInput: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 14, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b' },
  approveButton: { flexDirection: 'row', gap: 8, backgroundColor: '#3b82f6', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rejectButton: { flexDirection: 'row', gap: 8, backgroundColor: '#fff', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#ef4444', marginBottom: 20 },
  rejectButtonText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});