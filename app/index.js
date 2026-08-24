import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // 4 second baad onboarding par bhej dega
      router.replace('/onboarding');
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo.png')} 
        style={styles.logo} 
      />
      <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 320, height: 320, resizeMode: 'contain' },
  loader: { marginTop: 40, transform: [{ scale: 1.5 }] }
});