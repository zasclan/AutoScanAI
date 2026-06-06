import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function StartScreen() {
  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('onboardingDone');

      setTimeout(() => {
        if (seen === 'true') {
          router.replace('/(tabs)' as any);
        } else {
          router.replace('/onboarding' as any);
        }
      }, 1200);
    };

    checkOnboarding();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>AutoScan AI</Text>
        <Text style={styles.text}>Preparing vehicle inspection system...</Text>
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
  },
  text: {
    marginTop: 10,
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '700',
    textAlign: 'center',
  },
});