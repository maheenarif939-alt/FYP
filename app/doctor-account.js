import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { clearSession, getProfile, updateProfileInfo } from '../api/client';

export default function DoctorAccount() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', hospital: '', specialty: '', experience_years: '' });

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        hospital: data.hospital || '',
        specialty: data.specialty || '',
        experience_years: data.experience_years ? String(data.experience_years) : '',
      });
    } catch (error) {
      console.log('Doctor profile load error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateProfileInfo(form);
      setProfile(updated);
      setIsEditing(false);
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Account</Text>
        <TouchableOpacity onPress={() => router.push('/pending-cases')}>
          <Ionicons name="notifications-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/*  Profile Card  */}
          <View style={styles.profileCard}>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => setIsEditing((prev) => !prev)}
            >
              <Ionicons name={isEditing ? 'close' : 'create-outline'} size={20} color="#3b82f6" />
            </TouchableOpacity>

            <Image
              source={require('../assets/images/doctor.png')}
              style={styles.avatar}
            />
            <Text style={styles.name}>Dr. {profile?.full_name}</Text>
            <Text style={styles.specialty}>{profile?.specialty || 'Dermatologist'}</Text>

            {!isEditing ? (
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={18} color="#3b82f6" />
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{profile?.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color="#3b82f6" />
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{profile?.phone || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={18} color="#3b82f6" />
                  <Text style={styles.label}>Hospital:</Text>
                  <Text style={styles.value}>{profile?.hospital || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="ribbon-outline" size={18} color="#3b82f6" />
                  <Text style={styles.label}>Experience:</Text>
                  <Text style={styles.value}>
                    {profile?.experience_years ? `${profile.experience_years} Years` : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#3b82f6" />
                  <Text style={styles.label}>Status:</Text>
                  <Text style={[styles.value, { color: profile?.is_doctor_approved ? '#22c55e' : '#ef4444' }]}>
                    {profile?.is_doctor_approved ? 'Approved' : 'Pending Approval'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.editForm}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput style={styles.input} value={form.full_name} onChangeText={(t) => setForm({ ...form, full_name: t })} />

                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput style={styles.input} value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} keyboardType="phone-pad" />

                <Text style={styles.fieldLabel}>Hospital</Text>
                <TextInput style={styles.input} value={form.hospital} onChangeText={(t) => setForm({ ...form, hospital: t })} />

                <Text style={styles.fieldLabel}>Specialty</Text>
                <TextInput style={styles.input} value={form.specialty} onChangeText={(t) => setForm({ ...form, specialty: t })} />

                <Text style={styles.fieldLabel}>Experience (Years)</Text>
                <TextInput style={styles.input} value={form.experience_years} onChangeText={(t) => setForm({ ...form, experience_years: t })} keyboardType="numeric" />

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#3b82f6' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  profileCard: { backgroundColor: '#fff', padding: 25, borderRadius: 25, alignItems: 'center', elevation: 5, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 18 },
  editIconButton: { position: 'absolute', top: 15, right: 15, padding: 6, backgroundColor: '#eff6ff', borderRadius: 10 },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 15, borderWidth: 3, borderColor: '#3b82f6' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  specialty: { fontSize: 14, color: '#3b82f6', marginBottom: 20, fontWeight: '600' },
  infoContainer: { width: '100%', marginTop: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
  label: { fontSize: 13, color: '#64748b', marginLeft: 8, width: 80 },
  value: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1, textAlign: 'right' },

  editForm: { width: '100%', marginTop: 5 },
  fieldLabel: { fontSize: 12, color: '#64748b', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b', fontSize: 14 },
  saveButton: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 16, alignItems: 'center', marginTop: 18 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    marginTop: 5,
    padding: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});