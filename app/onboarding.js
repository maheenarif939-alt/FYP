import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  { id: '1', title: 'AI-POWERED FACIAL SKIN ANALYSIS', desc: 'Analysis of facial skin diseases using images.', img: require('../assets/images/slide1.png') },
  { id: '2', title: 'PERSONALIZED RECOMMENDATIONS', desc: 'Customized skincare recommendations just for you.', img: require('../assets/images/slide2.png') },
  { id: '3', title: 'CONNECT WITH EXPERTS', desc: 'Personal advice & consultation to help you to take smart skincare decisions.', img: require('../assets/images/slide3.png') },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const router = useRouter(); // Expo Router ka hook

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/login')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Image Box filling the area */}
            <View style={styles.imageBox}>
              <Image source={item.img} style={styles.image} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === currentIndex ? '#3b82f6' : '#cbd5e1' }]} />
        ))}
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => currentIndex < 2 ? flatListRef.current.scrollToIndex({ index: currentIndex + 1 }) : router.replace('/login')}
      >
        <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
          <Text style={styles.btnText}>{currentIndex === 2 ? 'Get Started' : 'Next'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FBFF' },
  skipBtn: { position: 'absolute', top: 60, right: 20, zIndex: 1 },
  skipText: { fontSize: 16, color: '#64748b', fontWeight: '500' },
  slide: { width, alignItems: 'center', justifyContent: 'center', padding: 20 },
  
  imageBox: { 
    width: 320, 
    height: 320, 
    borderRadius: 30, 
    backgroundColor: '#FFFFFF', 
    marginBottom: 40,
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    elevation: 4, 
  },
  
  image: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 5 },
  
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1e293b', marginBottom: 10 },
  desc: { fontSize: 14, color: '#64748b', textAlign: 'center', paddingHorizontal: 40, marginBottom: 20 },
  
  button: { width: '85%', height: 55, alignSelf: 'center', marginBottom: 50 },
  gradient: { flex: 1, borderRadius: 27.5, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});