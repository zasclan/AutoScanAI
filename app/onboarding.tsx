import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'scan-outline' as const,
    iconColor: '#60a5fa',
    iconBg: 'rgba(37,99,235,0.15)',
    gradient: ['#020617', '#0f172a', '#1e3a8a'] as const,
    title: 'Welcome to\nAutoScan AI',
    subtitle: 'Pakistan\'s first AI-powered vehicle damage assessment app. Instant analysis, real cost estimates.',
    badge: '🇵🇰 Made for Pakistan',
  },
  {
    id: '2',
    icon: 'camera-outline' as const,
    iconColor: '#34d399',
    iconBg: 'rgba(16,185,129,0.15)',
    gradient: ['#022c22', '#064e3b', '#065f46'] as const,
    title: 'Snap &\nAnalyse',
    subtitle: 'Take or upload a photo of any vehicle damage. Our AI detects dents, scratches, bumper damage and more in seconds.',
    badge: '⚡ Powered by Groq AI',
  },
  {
    id: '3',
    icon: 'bar-chart-outline' as const,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.15)',
    gradient: ['#1c1004', '#292524', '#44270a'] as const,
    title: 'Full Damage\nReport',
    subtitle: 'Get severity rating, body & paint condition scores, repair urgency, resale impact and a full PDF report.',
    badge: '📊 10+ data points per scan',
  },
  {
    id: '4',
    icon: 'cash-outline' as const,
    iconColor: '#a78bfa',
    iconBg: 'rgba(124,58,237,0.15)',
    gradient: ['#13001f', '#1e1b4b', '#2e1065'] as const,
    title: 'Local Cost\nEstimates',
    subtitle: 'Get repair cost ranges in PKR for your city — Lahore, Karachi, Islamabad, Gujranwala and more.',
    badge: '💰 PKR estimates by city',
  },
  {
    id: '5',
    icon: 'document-text-outline' as const,
    iconColor: '#f87171',
    iconBg: 'rgba(220,38,38,0.15)',
    gradient: ['#1f0707', '#1c0a0a', '#450a0a'] as const,
    title: 'Save &\nShare Reports',
    subtitle: 'Save inspection history, generate shareable PDFs and track all your vehicle scans in one place.',
    badge: '📂 Unlimited history',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <LinearGradient colors={item.gradient} style={styles.slide}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={finish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Icon area */}
      <View style={styles.iconWrapper}>
        <View style={[styles.iconRingOuter, { borderColor: item.iconColor + '30' }]}>
          <View style={[styles.iconRingInner, { borderColor: item.iconColor + '50' }]}>
            <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={58} color={item.iconColor} />
            </View>
          </View>
        </View>
      </View>

      {/* Badge */}
      <View style={[styles.badge, { borderColor: item.iconColor + '40' }]}>
        <Text style={[styles.badgeText, { color: item.iconColor }]}>{item.badge}</Text>
      </View>

      {/* Text */}
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </LinearGradient>
  );

  const slide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      />

      {/* Bottom control bar */}
      <View style={styles.controls}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const opacity  = scrollX.interpolate({ inputRange, outputRange: [0.35, 1, 0.35], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: slide.iconColor }]}
              />
            );
          })}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
          <LinearGradient
            colors={isLast ? ['#1d4ed8', '#2563eb'] : ['#1e293b', '#334155']}
            style={styles.nextBtn}
          >
            {isLast ? (
              <>
                <Ionicons name="rocket-outline" size={20} color="#fff" />
                <Text style={styles.nextText}>Get Started</Text>
              </>
            ) : (
              <>
                <Text style={styles.nextText}>Next</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },

  slide: {
    width, minHeight: height,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 30, paddingBottom: 160,
  },

  skipBtn: {
    position: 'absolute', top: 56, right: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  skipText: { color: '#94a3b8', fontSize: 13, fontWeight: '800' },

  iconWrapper: { marginBottom: 32 },
  iconRingOuter: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  iconRingInner: {
    width: 158, height: 158, borderRadius: 79,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  iconBox: {
    width: 118, height: 118, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },

  badge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  badgeText: { fontSize: 12, fontWeight: '900' },

  slideTitle: {
    fontSize: 38, fontWeight: '900', color: '#ffffff',
    textAlign: 'center', lineHeight: 44, marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16, color: '#94a3b8', fontWeight: '600',
    textAlign: 'center', lineHeight: 25, maxWidth: 320,
  },

  // Bottom bar
  controls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(2,6,23,0.95)',
    paddingHorizontal: 28, paddingVertical: 22, paddingBottom: 44,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 26, paddingVertical: 14, borderRadius: 18,
  },
  nextText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
});