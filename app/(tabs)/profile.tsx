import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Report = {
  id: string;
  severity?: string;
  cost?: string;
  overallScore?: string;
};

const APP_VERSION = '1.0.0';

export default function ProfileScreen() {
  const [reports, setReports] = useState<Report[]>([]);

  const loadReports = async () => {
    const saved = await AsyncStorage.getItem('inspectionReports');
    setReports(saved ? JSON.parse(saved) : []);
  };

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  const totalReports = reports.length;
  const severeCases = reports.filter((r) => r.severity === 'Severe').length;
  const minorCases = reports.filter((r) => r.severity === 'Minor').length;
  const moderateCases = reports.filter((r) => r.severity === 'Moderate').length;

  const avgScore = () => {
    const scores = reports
      .map((r) => parseFloat(r.overallScore || '0'))
      .filter((s) => s > 0);

    if (scores.length === 0) return 'N/A';

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) + '%';
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all saved inspection reports.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('inspectionReports');
            setReports([]);
            Alert.alert('Done', 'All inspection data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <LinearGradient colors={['#020617', '#0f172a', '#2563eb']} style={styles.heroCard}>
          <View style={styles.logoCircle}>
            <Ionicons name="car-sport-outline" size={46} color="#ffffff" />
          </View>

          <Text style={styles.appName}>AutoScan AI</Text>
          <Text style={styles.tagline}>
            AI-Powered Vehicle Damage Inspection & Repair Cost Estimation System
          </Text>

          <View style={styles.versionBadge}>
            <Ionicons name="sparkles" size={12} color="#2563eb" />
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
        </LinearGradient>

        <Text style={styles.section}>Inspection Overview</Text>

        <View style={styles.statsGrid}>
          <StatBox label="Reports" value={String(totalReports)} color="#2563eb" />
          <StatBox label="Minor" value={String(minorCases)} color="#16a34a" />
          <StatBox label="Moderate" value={String(moderateCases)} color="#d97706" />
          <StatBox label="Severe" value={String(severeCases)} color="#dc2626" />
        </View>

        <View style={styles.scoreCard}>
          <View>
            <Text style={styles.scoreLabel}>Average Vehicle Health Score</Text>
            <Text style={styles.scoreSubLabel}>
              Based on saved inspection reports
            </Text>
          </View>
          <Text style={styles.scoreValue}>{avgScore()}</Text>
        </View>

        <Text style={styles.section}>How The App Works</Text>

        <View style={styles.card}>
          <Step number="1" title="Capture Vehicle Image" text="User captures or uploads a clear image of the damaged vehicle area." />
          <Step number="2" title="AI Visual Analysis" text="Groq vision model checks if a vehicle is visible and detects damage type, affected area, and severity." />
          <Step number="3" title="Inspection Scoring" text="The app calculates body condition, paint condition, safety impact, repair urgency, and overall score." />
          <Step number="4" title="Report Generation" text="A detailed inspection report is generated with cost estimate, repair suggestions, and PDF export." />
        </View>

        <Text style={styles.section}>Core Capabilities</Text>

        <View style={styles.card}>
          <Feature icon="camera-outline" title="Camera & Gallery" text="Inspect vehicle damage using live camera capture or uploaded images." />
          <Feature icon="shield-checkmark-outline" title="Vehicle Validation" text="Rejects unrelated images and continues only when a vehicle is detected." />
          <Feature icon="analytics-outline" title="Damage Assessment" text="Detects visible scratches, dents, paint damage, bumper damage, cracks, and broken parts." />
          <Feature icon="cash-outline" title="PKR Cost Estimate" text="Provides estimated repair cost range in Pakistani Rupees." />
          <Feature icon="document-text-outline" title="PDF Report" text="Generates professional inspection reports for sharing or submission." />
          <Feature icon="archive-outline" title="Local History" text="Saves reports locally using AsyncStorage for quick access later." />
        </View>

        <Text style={styles.section}>Technical Specifications</Text>

        <View style={styles.specCard}>
          <Info label="Framework" value="React Native Expo" />
          <Info label="AI Engine" value="Groq Vision API" />
          <Info label="Storage" value="AsyncStorage" />
          <Info label="PDF System" value="Expo Print + Expo Sharing" />
          <Info label="Platform" value="Android Mobile App" />
          <Info label="Report Type" value="AI-assisted visual inspection" />
        </View>

        <Text style={styles.section}>Quick Actions</Text>

        <View style={styles.menuCard}>
          <MenuItem
            icon="scan-outline"
            color="#2563eb"
            bg="#eff6ff"
            label="Start New Inspection"
            onPress={() => router.push('/inspect' as any)}
          />

          <Divider />

          <MenuItem
            icon="document-text-outline"
            color="#16a34a"
            bg="#f0fdf4"
            label="View Saved Reports"
            badge={totalReports > 0 ? String(totalReports) : undefined}
            onPress={() => router.push('/reports' as any)}
          />

          <Divider />

          <MenuItem
            icon="home-outline"
            color="#7c3aed"
            bg="#faf5ff"
            label="Go to Dashboard"
            onPress={() => router.push('/' as any)}
          />
        </View>

        <Text style={styles.section}>Project Purpose</Text>

        <View style={styles.card}>
          <Text style={styles.paragraph}>
            AutoScan AI is designed to support vehicle owners, repair workshops, and inspection users by providing a fast first-level visual damage assessment. The system helps users understand the visible condition of a vehicle, estimate repair cost, and generate a structured report before visiting a workshop.
          </Text>
        </View>

        <Text style={styles.section}>Important Disclaimer</Text>

        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={24} color="#d97706" />
          <Text style={styles.warningText}>
            This app provides AI-assisted visual inspection only. Final repair decisions, safety checks, and exact cost must be confirmed by a professional mechanic or body workshop.
          </Text>
        </View>

        {totalReports > 0 && (
          <>
            <Text style={[styles.section, { color: '#dc2626' }]}>Danger Zone</Text>

            <TouchableOpacity style={styles.dangerButton} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={18} color="#dc2626" />
              <Text style={styles.dangerText}>
                Clear All Inspection Data ({totalReports})
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footer}>
          AutoScan AI • Final Year Project • {new Date().getFullYear()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color }]}>
      <Text style={[styles.statNum, { color }]}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepText}>{text}</Text>
      </View>
    </View>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={20} color="#2563eb" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  color,
  bg,
  label,
  badge,
  onPress,
}: {
  icon: string;
  color: string;
  bg: string;
  label: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {badge && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f7fb' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 95,
  },

  heroCard: {
    borderRadius: 42,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  appName: {
    fontSize: 29,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#dbeafe',
    textAlign: 'center',
    fontWeight: '600',
  },
  versionBadge: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2563eb',
  },

  section: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 3,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLbl: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textAlign: 'center',
  },

  scoreCard: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    maxWidth: 180,
  },
  scoreSubLabel: {
    marginTop: 3,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#2563eb',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paragraph: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '600',
  },

  stepRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#2563eb',
    fontWeight: '900',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  stepText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
    fontWeight: '600',
  },

  featureRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  featureText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
    fontWeight: '600',
  },

  specCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '800',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '900',
  },

  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  menuBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2563eb',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 70,
  },

  warningCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#fde68a',
    flexDirection: 'row',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#92400e',
    fontWeight: '700',
  },

  dangerButton: {
    backgroundColor: '#fff1f2',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#dc2626',
  },

  footer: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
});