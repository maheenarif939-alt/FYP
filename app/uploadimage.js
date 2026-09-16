import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { uploadCaseImage } from '../api/client';

export default function UploadImage() {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Opens the camera app.

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access so you can capture a photo of the affected skin area.'
      );
      return;
    }

    Alert.alert(
      'Photo Tip',
      'Please make sure the affected skin area (face) is clearly visible and in focus before capturing.',
      [
        {
          text: 'Open Camera',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.5, // lower quality 
              allowsEditing: true, // shows native crop/confirm screen with Retake option
              cameraType: ImagePicker.CameraType.front, //  front camera
            });
            if (!result.canceled) {
              setSelectedImage(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }
  // Gallery option
  const pickFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Gallery Permission Required', 'Please allow photo library access to choose an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeSelectedImage = () => setSelectedImage(null);

  // Final upload to backend
  const handleConfirm = async () => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      const newCase = await uploadCaseImage(selectedImage);
      router.push({
        pathname: '/payment',
        params: { caseId: newCase.id, caseNumber: newCase.case_number },
      });
    } catch (error) {
      Alert.alert('Upload Failed', error?.message || 'Could not connect to the server. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.title}>Analyze Skin</Text>
        </View>

        <View style={styles.imageBox}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.preview} />
          ) : (
            <Ionicons name="camera-outline" size={80} color="#cbd5e1" />
          )}
        </View>

        {selectedImage && (
          <TouchableOpacity style={styles.retakeLink} onPress={removeSelectedImage}>
            <Text style={styles.retakeLinkText}>Remove photo & Choose again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.optionBtn} onPress={takePhotoWithCamera}>
          <Ionicons name="camera" size={24} color="#3b82f6" />
          <Text style={styles.optText}>Take a Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionBtn} onPress={pickFromGallery}>
          <Ionicons name="images" size={24} color="#3b82f6" />
          <Text style={styles.optText}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmBtn, !selectedImage && { opacity: 0.5 }]}
          onPress={handleConfirm}
          disabled={!selectedImage || uploading}
        >
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>CONFIRM </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}>
          <Ionicons name="home" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/payment')}>
          <Ionicons name="card" size={26} color="#3b82f6" />
          <Text style={styles.navText}>Payment</Text>
        </TouchableOpacity>
        <View style={styles.centerBtn}>
          <Ionicons name="camera" size={32} color="#fff" />
        </View>
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
  scroll: { padding: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', marginLeft: 15 },
  imageBox: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginBottom: 10,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  retakeLink: { alignSelf: 'center', marginBottom: 15 },
  retakeLinkText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  optionBtn: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optText: { marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#3b82f6' },
  confirmBtn: { width: '100%', height: 60, borderRadius: 30, marginTop: 10, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  centerBtn: { backgroundColor: '#8b5cf6', padding: 16, borderRadius: 35, marginTop: -50, elevation: 8 },
});
