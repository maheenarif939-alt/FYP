import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PayConsultationFee() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [uniqueId, setUniqueId] = useState('');
  const phoneNumber = "0300-1234567";

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(phoneNumber);
    Alert.alert("Success", "Phone number copied to clipboard!");
  };

  useEffect(() => {
    setUniqueId("DCA-842195736");
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PAY CONSULTATION FEE</Text>
        </View>

        {/* Payment Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Complete Your Payment</Text>
          <Text style={styles.subTitle}>Send your payment via JazzCash to the number below</Text>
          
          <View style={styles.jazzCashBox}>
            <Text style={styles.payToText}>PAY TO THIS NUMBER</Text>
            
            <TouchableOpacity style={styles.logoNumberRow} onPress={copyToClipboard}>
              <Image 
                source={require('../assets/jazzcash.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <Text style={styles.number}>{phoneNumber}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
              <Ionicons name="copy-outline" size={16} color="#3b82f6" />
              <Text style={styles.copyText}> Tap to copy number</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reminderBox}>
            <Text style={styles.noteLabel}>Note: </Text>
            <Text style={styles.reminderText}>After completing the transaction, please take a screenshot and upload it below.</Text>
          </View>

          <Text style={styles.sectionHeading}>Payment Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unique ID (Auto Generated)</Text>
            <Text style={styles.value}>{uniqueId}</Text> 
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter Transaction ID</Text>
            <TextInput placeholder="e.g. T1234567890" style={styles.input} placeholderTextColor="#94a3b8" />
          </View>

          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={32} color="#3b82f6" />
                <Text style={styles.uploadText}>Click to upload screenshot</Text>
                <Text style={styles.uploadSub}>PNG, JPG up to 5MB</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.detectBtn} onPress={() => Alert.alert("Success", "Payment submitted!")}>
            <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
              <Text style={styles.btnText}>Submit Payment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}>
          <Ionicons name="home" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 140 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#3b82f6', marginLeft: 15 },
  card: { backgroundColor: '#fff', borderRadius: 25, padding: 22, elevation: 5 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#3b82f6' },
  subTitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 15 },
  jazzCashBox: { backgroundColor: '#eff6ff', padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  payToText: { fontSize: 10, color: '#3b82f6', fontWeight: 'bold', marginBottom: 5 },
  logoNumberRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  logo: { width: 60, height: 40, resizeMode: 'contain', marginRight: 10, },
  number: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  copyText: { fontSize: 12, color: '#3b82f6' },
  reminderBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  noteLabel: { fontSize: 13, fontWeight: 'bold', color: '#3b82f6' },
  reminderText: { fontSize: 13, color: '#1e293b', flex: 1, lineHeight: 18 },
  sectionHeading: { fontSize: 15, fontWeight: 'bold', marginBottom: 12, color: '#3b82f6' },
  inputGroup: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  label: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  value: { fontWeight: 'bold', marginTop: 4, color: '#1e293b', fontSize: 14 },
  input: { borderBottomWidth: 1, borderColor: '#3b82f6', paddingVertical: 4, color: '#1e293b', fontSize: 14 },
  uploadBox: { borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#3b82f6', padding: 25, alignItems: 'center', borderRadius: 15, marginVertical: 12, backgroundColor: '#f8fafc' },
  previewImage: { width: '100%', height: 120, borderRadius: 12 },
  uploadText: { fontSize: 13, color: '#3b82f6', marginTop: 8, fontWeight: '600' },
  uploadSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  detectBtn: { height: 55, borderRadius: 27.5, marginTop: 15, overflow: 'hidden', elevation: 5 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 15, paddingBottom: 20, position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 10, borderTopWidth: 1, borderColor: '#e2e8f0' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  centerBtn: { backgroundColor: '#8b5cf6', padding: 16, borderRadius: 35, marginTop: -50, elevation: 8, shadowColor: '#8b5cf6', shadowOpacity: 0.4, shadowRadius: 10 }
});