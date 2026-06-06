import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert, Image, SafeAreaView, ScrollView,
    StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

type Report = {
  id: string; imageUri?: string; vehicleMake?: string; vehicleModel?: string;
  vehicleYear?: string; vehicleMileage?: string; vehicleCity?: string;
  vehicleType?: string; severity?: string; damage?: string[]; cost?: string;
  repairSuggestion?: string; bodyCondition?: string; paintCondition?: string;
  safetyImpact?: string; repairUrgency?: string; resaleImpact?: string;
  overallScore?: string; date?: string;
};

const SEV_COLOR: Record<string, string> = { Minor: '#16a34a', Moderate: '#d97706', Severe: '#dc2626' };
const FILTERS = ['All', 'Minor', 'Moderate', 'Severe'];

export default function ReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const loadReports = async () => {
    const saved = await AsyncStorage.getItem('inspectionReports');
    setReports(saved ? JSON.parse(saved) : []);
  };

  useFocusEffect(useCallback(() => { loadReports(); }, []));

  const deleteReport = (id: string) => {
    Alert.alert('Delete Report', 'Remove this inspection from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = reports.filter((r) => r.id !== id);
          setReports(updated);
          await AsyncStorage.setItem('inspectionReports', JSON.stringify(updated));
        },
      },
    ]);
  };

  const clearAll = () => {
    Alert.alert('Clear All Reports', 'This will permanently delete all saved reports.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => {
          setReports([]);
          await AsyncStorage.removeItem('inspectionReports');
        },
      },
    ]);
  };

  const filtered = reports.filter((r) => {
    const matchSev = filter === 'All' || r.severity === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.vehicleMake || '').toLowerCase().includes(q) ||
      (r.vehicleModel || '').toLowerCase().includes(q) ||
      (r.vehicleCity || '').toLowerCase().includes(q) ||
      (r.severity || '').toLowerCase().includes(q);
    return matchSev && matchSearch;
  });

  const openReport = (r: Report) =>
    router.push({
      pathname: '/result',
      params: {
        imageUri: r.imageUri, vehicleMake: r.vehicleMake, vehicleModel: r.vehicleModel,
        vehicleYear: r.vehicleYear, vehicleMileage: r.vehicleMileage,
        vehicleCity: r.vehicleCity, vehicleType: r.vehicleType,
        severity: r.severity, damage: JSON.stringify(r.damage || []),
        estimatedCost: r.cost, repairSuggestion: r.repairSuggestion,
        bodyCondition: r.bodyCondition, paintCondition: r.paintCondition,
        safetyImpact: r.safetyImpact, repairUrgency: r.repairUrgency,
        resaleImpact: r.resaleImpact, overallScore: r.overallScore,
      },
    });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Inspection Reports</Text>
            <Text style={styles.subtitle}>{reports.length} saved report{reports.length !== 1 ? 's' : ''}</Text>
          </View>
          {reports.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={17} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by make, model, city, severity..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={17} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipActive,
                  f !== 'All' && filter === f && { backgroundColor: SEV_COLOR[f] }]}
                onPress={() => setFilter(f)}
              >
                {f !== 'All' && (
                  <View style={[styles.filterDot, {
                    backgroundColor: filter === f ? '#fff' : SEV_COLOR[f],
                  }]} />
                )}
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f}{f !== 'All' ? ` (${reports.filter(r => r.severity === f).length})` : ` (${reports.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Empty state */}
        {reports.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="document-text-outline" size={40} color="#2563eb" />
            </View>
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptyText}>
              Inspect a vehicle and save the report — it will appear here with full history.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/inspect')}>
              <Ionicons name="scan-outline" size={16} color="#fff" />
              <Text style={styles.emptyBtnText}>Start Inspection</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={36} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptyText}>Try a different filter or search term.</Text>
          </View>
        ) : (
          filtered.map((r, i) => {
            const name = `${r.vehicleMake || ''} ${r.vehicleModel || ''}`.trim() || r.vehicleType || 'Vehicle';
            const sevColor = SEV_COLOR[r.severity || ''] || '#2563eb';
            const score = r.overallScore ? parseInt(r.overallScore) : null;

            return (
              <View key={r.id} style={styles.cardWrapper}>
                {/* Latest badge */}
                {i === 0 && filter === 'All' && !search && (
                  <View style={styles.latestBanner}>
                    <Ionicons name="time-outline" size={12} color="#2563eb" />
                    <Text style={styles.latestBannerText}>Most Recent</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.reportCard, i === 0 && filter === 'All' && !search && styles.reportCardLatest]}
                  onPress={() => openReport(r)}
                  activeOpacity={0.85}
                >
                  {/* Image */}
                  {r.imageUri ? (
                    <Image source={{ uri: r.imageUri }} style={styles.reportImg} />
                  ) : (
                    <View style={styles.reportImgPlaceholder}>
                      <Ionicons name="car-outline" size={26} color="#2563eb" />
                    </View>
                  )}

                  {/* Info */}
                  <View style={styles.reportInfo}>
                    <View style={styles.reportTopRow}>
                      <Text style={styles.reportName} numberOfLines={1}>{name}</Text>
                      {score !== null && (
                        <View style={styles.scorePill}>
                          <Text style={styles.scorePillText}>{score}%</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.reportDate}>{r.date || 'N/A'} • {r.vehicleCity || 'N/A'}</Text>

                    <View style={styles.reportBadgeRow}>
                      <View style={[styles.sevPill, { backgroundColor: sevColor + '18' }]}>
                        <View style={[styles.sevDot, { backgroundColor: sevColor }]} />
                        <Text style={[styles.sevText, { color: sevColor }]}>{r.severity || 'N/A'}</Text>
                      </View>
                      {r.repairUrgency && (
                        <View style={styles.urgPill}>
                          <Text style={styles.urgText}>{r.repairUrgency} Urgency</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.reportCost} numberOfLines={1}>{r.cost || 'Estimate N/A'}</Text>
                    {r.damage && r.damage[0] && (
                      <Text style={styles.reportDmg} numberOfLines={1}>• {r.damage[0]}</Text>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>

                {/* Delete */}
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteReport(r.id)}>
                  <Ionicons name="trash-outline" size={15} color="#ef4444" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* New inspection CTA */}
        {reports.length > 0 && (
          <TouchableOpacity style={styles.newInspectBtn} onPress={() => router.push('/inspect')}>
            <Ionicons name="add-circle-outline" size={18} color="#2563eb" />
            <Text style={styles.newInspectText}>New Inspection</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f7fb' },
  container: { padding: 20, paddingTop: 78, paddingBottom: 110 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', fontWeight: '700', marginTop: 3 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff1f2', paddingHorizontal: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#fecaca' },
  clearText: { color: '#dc2626', fontSize: 12, fontWeight: '900' },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '600' },

  filterScroll: { marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f1f5f9', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { fontSize: 12, fontWeight: '800', color: '#475569' },
  filterTextActive: { color: '#fff' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20 },
  emptyIconBg: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  emptyText: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 19, maxWidth: 280 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#2563eb', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 14, marginTop: 4 },
  emptyBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  cardWrapper: { marginBottom: 16 },
  latestBanner: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 6 },
  latestBannerText: { fontSize: 11, fontWeight: '900', color: '#2563eb' },

  reportCard: { backgroundColor: '#fff', borderRadius: 20, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  reportCardLatest: { borderColor: '#bfdbfe', borderWidth: 1.5 },
  reportImg: { width: 80, height: 80, borderRadius: 14, resizeMode: 'cover' },
  reportImgPlaceholder: { width: 80, height: 80, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1 },
  reportTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  reportName: { fontSize: 14, fontWeight: '900', color: '#0f172a', flex: 1 },
  scorePill: { backgroundColor: '#eff6ff', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7 },
  scorePillText: { fontSize: 11, fontWeight: '900', color: '#2563eb' },
  reportDate: { fontSize: 11, color: '#94a3b8', fontWeight: '700', marginBottom: 6 },
  reportBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  sevPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  sevDot: { width: 5, height: 5, borderRadius: 3 },
  sevText: { fontSize: 11, fontWeight: '900' },
  urgPill: { backgroundColor: '#f8fafc', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, borderWidth: 1, borderColor: '#e2e8f0' },
  urgText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  reportCost: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  reportDmg: { fontSize: 11, color: '#64748b', fontWeight: '600' },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6, backgroundColor: '#fff1f2', paddingVertical: 9, borderRadius: 13, borderWidth: 1, borderColor: '#fecaca' },
  deleteBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '900' },

  newInspectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  newInspectText: { fontSize: 14, fontWeight: '900', color: '#2563eb' },
});