import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="doctor-dashboard" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="uploadimage" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="casetracking" />
      <Stack.Screen name="doctor" />
      <Stack.Screen name="history" />
      <Stack.Screen name="result" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="all-cases" />
      <Stack.Screen name="pending-cases" />
      <Stack.Screen name="approved-cases" />
      <Stack.Screen name="doctor-verify" />
    </Stack>
  );
}