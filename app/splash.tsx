import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const ringScale1  = useRef(new Animated.Value(0.6)).current;
  const ringOpacity1= useRef(new Animated.Value(0)).current;
  const ringScale2  = useRef(new Animated.Value(0.4)).current;
  const ringOpacity2= useRef(new Animated.Value(0)).current;
  const barWidth    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale1, { toValue: 1.4, duration: 1800, useNativeDriver: true }),
          Animated.timing(ringOpacity1, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale1, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          Animated.timing(ringOpacity1, { toValue: 0.25, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale2, { toValue: 1.8, duration: 2000, useNativeDriver: true }),
            Animated.timing(ringOpacity2, { toValue: 0, duration: 2000, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(ringScale2, { toValue: 0.4, duration: 0, useNativeDriver: true }),
            Animated.timing(ringOpacity2, { toValue: 0.15, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, 600);

    // Logo entrance
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(tagOpacity,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(barWidth,    { toValue: width * 0.55, duration: 900, useNativeDriver: false }),
      Animated.delay(500),
    ]).start(() => router.replace('/onboarding'));
  }, [barWidth, logoOpacity, logoScale, ringOpacity1, ringOpacity2, ringScale1, ringScale2, tagOpacity, textOpacity]);

  return (
    <LinearGradient colors={['#020617', '#0f172a', '#1e3a8a']} style={styles.container}>

      {/* Pulse rings */}
      <Animated.View style={[styles.ring, { transform: [{ scale: ringScale1 }], opacity: ringOpacity1 }]} />
      <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ringScale2 }], opacity: ringOpacity2 }]} />

      {/* Logo block */}
      <Animated.View style={{ alignItems: 'center', opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <View style={styles.logoBox}>
          {/* Car icon built from shapes */}
          <View style={styles.carBody}>
            <View style={styles.carRoof} />
            <View style={styles.carBase} />
            <View style={styles.wheelLeft} />
            <View style={styles.wheelRight} />
            {/* Scan line */}
            <View style={styles.scanLine} />
          </View>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        AutoScan<Text style={styles.appNameBlue}> AI</Text>
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        AI-Powered Vehicle Damage Assessment
      </Animated.Text>

      {/* Loading bar */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>

      <Text style={styles.loadingText}>Starting up...</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },

  ring: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1.5, borderColor: '#3b82f6',
  },
  ring2: { width: 280, height: 280, borderRadius: 140 },

  logoBox: {
    width: 110, height: 110, borderRadius: 32,
    backgroundColor: 'rgba(37,99,235,0.18)',
    borderWidth: 1.5, borderColor: 'rgba(59,130,246,0.4)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  carBody: { width: 68, height: 38, alignItems: 'center', justifyContent: 'center' },
  carRoof: {
    position: 'absolute', top: 0, left: 14,
    width: 40, height: 16, borderRadius: 8,
    backgroundColor: '#60a5fa',
  },
  carBase: {
    position: 'absolute', bottom: 8, left: 0,
    width: 68, height: 16, borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  wheelLeft: {
    position: 'absolute', bottom: 0, left: 8,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#1e3a8a', borderWidth: 2, borderColor: '#93c5fd',
  },
  wheelRight: {
    position: 'absolute', bottom: 0, right: 8,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#1e3a8a', borderWidth: 2, borderColor: '#93c5fd',
  },
  scanLine: {
    position: 'absolute', top: 12, left: 0,
    width: 68, height: 2,
    backgroundColor: '#22d3ee', opacity: 0.8, borderRadius: 1,
  },

  appName: { fontSize: 38, fontWeight: '900', color: '#ffffff', letterSpacing: 1 },
  appNameBlue: { color: '#60a5fa' },
  tagline: { fontSize: 14, color: '#94a3b8', fontWeight: '600', letterSpacing: 0.5 },

  barTrack: {
    marginTop: 32, width: width * 0.55, height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden',
  },
  barFill: { height: 4, backgroundColor: '#3b82f6', borderRadius: 2 },
  loadingText: { fontSize: 12, color: '#475569', fontWeight: '700', marginTop: 8 },
});
