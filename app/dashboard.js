import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  const router = useRouter(); 

  const blocks = [
    { title: 'Facial Skin Analysis', icon: 'scan', route: '/uploadimage' },
    { title: 'Pay Consultation Fee', icon: 'card', route: '/payment' },
    { title: 'View Case Tracking', icon: 'analytics', route: '/casetracking' },
    { title: 'Connect with Dermatologist', icon: 'people', route: '/doctor' },
    { title: 'View Scan History', icon: 'time', route: '/history' },
  ];

  return (
    <LinearGradient colors={['#F8FBFF', '#E0EAFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header with Profile Icon */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profileRow} 
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-circle" size={45} color="#3b82f6" />
            <Text style={styles.welcomeText}>Hello, Eman 👋</Text>
          </TouchableOpacity>
          <Ionicons name="notifications-outline" size={26} color="#3b82f6" />
        </View>

        {/* Main Banner Image */}
        <View style={styles.bannerContainer}>
          <Image 
            source={require('../assets/images/image.png')} 
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Features Grid */}
        <View style={styles.grid}>
          {blocks.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.block} 
              onPress={() => router.push(item.route)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.blockText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Start Detection Button */}
        <TouchableOpacity style={styles.detectBtn} onPress={() => router.push('/uploadimage')}>
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
            <Text style={styles.btnText}>START DETECTION</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 150 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#3b82f6', marginLeft: 10 },
  bannerContainer: { width: '100%', height: 220, marginBottom: 25, borderRadius: 25, overflow: 'hidden' },
  bannerImage: { width: '100%', height: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  block: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#e0e7ff', elevation: 2 },
  iconContainer: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 15, marginBottom: 10 },
  blockText: { fontSize: 13, fontWeight: '600', color: '#3b82f6', textAlign: 'center' },
  detectBtn: { height: 55, borderRadius: 27.5, marginTop: 10, overflow: 'hidden', elevation: 5 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
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
    elevation: 10
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  centerBtn: { 
    backgroundColor: '#8b5cf6', 
    padding: 16, 
    borderRadius: 35, 
    marginTop: -50, 
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 10 
  }
});