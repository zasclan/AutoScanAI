import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SEV_COLOR: Record<string, string> = { Minor: '#16a34a', Moderate: '#d97706', Severe: '#dc2626' };
const URG_COLOR: Record<string, string> = { Low: '#16a34a', Medium: '#d97706', High: '#dc2626' };

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={sb.row}>
      <Text style={sb.label}>{label}</Text>
      <View style={sb.track}>
        <View style={[sb.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={[sb.val, { color }]}>{value}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  label: { width: 90, fontSize: 12, fontWeight: '800', color: '#475569' },
  track: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  val: { width: 30, fontSize: 13, fontWeight: '900', textAlign: 'right' },
});

export default function ResultScreen() {
  const [saved, setSaved] = useState(false);

  const {
    imageUri, vehicleMake, vehicleModel, vehicleYear, vehicleMileage,
    vehicleCity, vehicleType, severity, damage, estimatedCost,
    repairSuggestion, bodyCondition, paintCondition, safetyImpact,
    repairUrgency, resaleImpact, overallScore, affectedArea,
    damageType, affectedComponents,
  } = useLocalSearchParams<Record<string, string>>();

  const make     = vehicleMake   || 'N/A';
  const model    = vehicleModel  || 'N/A';
  const year     = vehicleYear   || 'N/A';
  const mileage  = vehicleMileage|| 'N/A';
  const city     = vehicleCity   || 'N/A';
  const vType    = vehicleType   || 'Passenger Vehicle';
  const sev      = severity      || 'Moderate';
  const cost     = estimatedCost || 'PKR 18,000 – 25,000';
  const suggestion = repairSuggestion || 'Professional workshop inspection recommended.';
  const body     = parseInt(bodyCondition  || '80');
  const paint    = parseInt(paintCondition || '75');
  const safety   = parseInt(safetyImpact   || '90');
  const urgency  = repairUrgency  || 'Medium';
  const resale   = resaleImpact   || 'Low';
  const score    = parseInt(overallScore   || '82');
  const area     = affectedArea   || 'Body Panel';
  const dtype    = damageType     || 'Surface Damage';
  const components: string[] = (affectedComponents && affectedComponents !== 'undefined')
    ? JSON.parse(affectedComponents) : ['Body Panel'];
  const damageList: string[] = (damage && damage !== 'undefined')
    ? JSON.parse(damage) : ['Visible body damage detected'];

  const vehicleName = `${make} ${model} ${year}`.replace(/N\/A /g, '').trim();
  const sevColor  = SEV_COLOR[sev]     || '#d97706';
  const urgColor  = URG_COLOR[urgency] || '#d97706';

  const recommendedService = sev === 'Severe'
    ? 'Full Auto Body Repair Workshop'
    : sev === 'Moderate' ? 'Denting & Painting Workshop'
    : 'Paint Correction / Detailing Center';

  const saveReport = async () => {
    if (saved) { Alert.alert('Already Saved', 'This report is already in your history.'); return; }
    const newReport = {
      id: Date.now().toString(),
      imageUri, vehicleMake: make, vehicleModel: model, vehicleYear: year,
      vehicleMileage: mileage, vehicleCity: city, vehicleType: vType,
      severity: sev, damage: damageList, cost, repairSuggestion: suggestion,
      bodyCondition, paintCondition, safetyImpact, repairUrgency: urgency,
      resaleImpact: resale, overallScore: String(score),
      date: new Date().toLocaleDateString('en-PK'),
    };
    const old = await AsyncStorage.getItem('inspectionReports');
    const list = old ? JSON.parse(old) : [];
    list.unshift(newReport);
    await AsyncStorage.setItem('inspectionReports', JSON.stringify(list));
    setSaved(true);
    Alert.alert('✅ Saved', 'Inspection report saved to your history.');
  };

  const generatePDF = async () => {
    const html = `
    <html><head><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:0}
      .header{background:linear-gradient(135deg,#0f172a,#1d4ed8);color:white;padding:32px;text-align:center}
      .logo{font-size:28px;font-weight:900;letter-spacing:1px}
      .logo span{color:#93c5fd}
      .meta{font-size:13px;color:#bfdbfe;margin-top:6px}
      .body{padding:24px}
      .section{background:white;border-radius:12px;padding:18px;margin-bottom:16px;border:1px solid #e2e8f0}
      .section h2{font-size:15px;font-weight:900;color:#1d4ed8;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #eff6ff}
      .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f8fafc;font-size:13px}
      .row .key{color:#64748b;font-weight:600}
      .row .val{color:#0f172a;font-weight:800}
      .score-big{font-size:36px;font-weight:900;color:#2563eb;text-align:center;padding:12px}
      .sev{display:inline-block;padding:6px 14px;border-radius:8px;font-weight:900;font-size:14px}
      .bar-row{margin-bottom:8px}
      .bar-label{font-size:12px;color:#475569;font-weight:700;margin-bottom:3px}
      .bar-track{background:#f1f5f9;border-radius:4px;height:8px}
      .bar-fill{height:8px;border-radius:4px}
      .damage-item{padding:5px 0;font-size:13px;color:#334155;border-bottom:1px solid #f1f5f9}
      .footer{text-align:center;font-size:11px;color:#94a3b8;padding:20px;background:#f8fafc}
      .pill{display:inline-block;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:800;margin:2px}
    </style></head><body>
      <div class="header">
        <div class="logo">AutoScan <span>AI</span></div>
        <div class="meta">Vehicle Damage Inspection Report • ${new Date().toLocaleDateString('en-PK')}</div>
      </div>
      <div class="body">
        <div class="section">
          <h2>🚗 Vehicle Information</h2>
          ${[['Make',make],['Model',model],['Year',year],['Mileage',mileage+' KM'],['City',city],['Type',vType]]
            .map(([k,v])=>`<div class="row"><span class="key">${k}</span><span class="val">${v}</span></div>`).join('')}
        </div>
        <div class="section">
          <h2>📊 Overall Health Score</h2>
          <div class="score-big">${score}/100</div>
          <div style="text-align:center;margin-bottom:8px">
            <span class="sev" style="background:${sevColor}20;color:${sevColor}">${sev} Severity</span>
            <span class="sev" style="background:${urgColor}20;color:${urgColor}">${urgency} Urgency</span>
          </div>
          <div class="bar-row"><div class="bar-label">Body Condition</div><div class="bar-track"><div class="bar-fill" style="width:${body}%;background:#2563eb"></div></div></div>
          <div class="bar-row"><div class="bar-label">Paint Condition</div><div class="bar-track"><div class="bar-fill" style="width:${paint}%;background:#7c3aed"></div></div></div>
          <div class="bar-row"><div class="bar-label">Safety Impact</div><div class="bar-track"><div class="bar-fill" style="width:${safety}%;background:#16a34a"></div></div></div>
        </div>
        <div class="section">
          <h2>🔍 Damage Assessment</h2>
          ${[['Affected Area',area],['Damage Type',dtype],['Resale Impact',resale]]
            .map(([k,v])=>`<div class="row"><span class="key">${k}</span><span class="val">${v}</span></div>`).join('')}
          <div style="margin-top:10px"><strong style="font-size:13px">Affected Components:</strong><br>
          ${components.map(c=>`<span class="pill" style="background:#eff6ff;color:#2563eb">${c}</span>`).join('')}</div>
          <div style="margin-top:10px"><strong style="font-size:13px">Detected Damage:</strong>
          ${damageList.map(d=>`<div class="damage-item">• ${d}</div>`).join('')}</div>
        </div>
        <div class="section">
          <h2>💰 Repair Cost Estimate</h2>
          <div style="font-size:26px;font-weight:900;color:#2563eb;padding:10px 0">${cost}</div>
          <p style="font-size:12px;color:#64748b">Estimate is for ${city} area. Actual cost may vary by workshop.</p>
        </div>
        <div class="section">
          <h2>🔧 Repair Recommendation</h2>
          <p style="font-size:13px;line-height:20px;color:#334155">${suggestion}</p>
          <div style="margin-top:12px;padding:10px;background:#eff6ff;border-radius:8px">
            <strong style="font-size:12px;color:#1d4ed8">Recommended Service: </strong>
            <span style="font-size:12px;color:#334155">${recommendedService}</span>
          </div>
        </div>
      </div>
      <div class="footer">Generated by AutoScan AI • AI-assisted report • Not a substitute for professional inspection</div>
    </body></html>`;
    const file = await Print.printToFileAsync({ html, base64: false });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Analysis Report</Text>
            <Text style={styles.subtitle}>AI vehicle inspection result</Text>
          </View>
          <TouchableOpacity
            style={[styles.saveQuickBtn, saved && styles.saveQuickBtnDone]}
            onPress={saveReport}
          >
            <Ionicons name={saved ? 'checkmark' : 'bookmark-outline'} size={18} color={saved ? '#16a34a' : '#2563eb'} />
          </TouchableOpacity>
        </View>

        {/* Vehicle Image */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.vehicleImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="car-sport-outline" size={48} color="#2563eb" />
            <Text style={{ color: '#94a3b8', marginTop: 8, fontWeight: '700' }}>No image provided</Text>
          </View>
        )}

        {/* Severity hero card */}
        <LinearGradient colors={['#0f172a', '#1e3a8a']} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>DAMAGE SEVERITY</Text>
              <Text style={[styles.heroSev, { color: sevColor }]}>{sev}</Text>
            </View>
            <View style={styles.scoreBubble}>
              <Text style={styles.scoreBubbleNum}>{score}</Text>
              <Text style={styles.scoreBubbleSub}>/ 100</Text>
            </View>
          </View>
          <View style={styles.heroPills}>
            <View style={[styles.heroPill, { backgroundColor: urgColor + '25' }]}>
              <View style={[styles.heroPillDot, { backgroundColor: urgColor }]} />
              <Text style={[styles.heroPillText, { color: urgColor }]}>{urgency} Urgency</Text>
            </View>
            <View style={[styles.heroPill, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
              <Ionicons name="location-outline" size={12} color="#93c5fd" />
              <Text style={[styles.heroPillText, { color: '#93c5fd' }]}>{city}</Text>
            </View>
            <View style={[styles.heroPill, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
              <Ionicons name="trending-down-outline" size={12} color="#fca5a5" />
              <Text style={[styles.heroPillText, { color: '#fca5a5' }]}>{resale} Resale Impact</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Score bars */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Condition Scores</Text>
          <ScoreBar label="Body Condition" value={body}  color="#2563eb" />
          <ScoreBar label="Paint Condition" value={paint} color="#7c3aed" />
          <ScoreBar label="Safety Impact"  value={safety} color="#16a34a" />
        </View>

        {/* Vehicle info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle Information</Text>
          {[
            { icon: 'car-outline',      label: 'Name',    val: vehicleName || vType },
            { icon: 'speedometer-outline', label: 'Mileage', val: mileage + ' KM' },
            { icon: 'location-outline', label: 'City',    val: city },
          ].map((r) => (
            <View key={r.label} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name={r.icon as any} size={15} color="#2563eb" />
              </View>
              <Text style={styles.infoLabel}>{r.label}</Text>
              <Text style={styles.infoVal}>{r.val}</Text>
            </View>
          ))}
        </View>

        {/* Damage findings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Damage Findings</Text>
          <View style={styles.findingsRow}>
            <View style={styles.findingChip}>
              <Text style={styles.findingKey}>Area</Text>
              <Text style={styles.findingVal}>{area}</Text>
            </View>
            <View style={styles.findingChip}>
              <Text style={styles.findingKey}>Type</Text>
              <Text style={styles.findingVal}>{dtype}</Text>
            </View>
          </View>
          <Text style={styles.miniLabel}>Affected Components</Text>
          <View style={styles.componentRow}>
            {components.map((c, i) => (
              <View key={i} style={styles.componentPill}>
                <Text style={styles.componentText}>{c}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.miniLabel}>Detected Damage</Text>
          {damageList.map((d, i) => (
            <View key={i} style={styles.damageItem}>
              <View style={[styles.damageDot, { backgroundColor: sevColor }]} />
              <Text style={styles.damageText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Cost */}
        <LinearGradient colors={['#1d4ed8', '#2563eb']} style={styles.costCard}>
          <Text style={styles.costLabel}>Estimated Repair Cost</Text>
          <Text style={styles.costValue}>{cost}</Text>
          <Text style={styles.costNote}>Local workshop estimate for {city}. Actual cost may vary.</Text>
        </LinearGradient>

        {/* Repair suggestion */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Repair Recommendation</Text>
          <Text style={styles.suggestionText}>{suggestion}</Text>
          <View style={styles.workshopBox}>
            <Ionicons name="build-outline" size={16} color="#2563eb" />
            <Text style={styles.workshopText}>{recommendedService}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <TouchableOpacity onPress={saveReport} activeOpacity={0.85}
          style={[styles.primaryBtn, saved && styles.primaryBtnSaved]}>
          <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>{saved ? 'Report Saved ✓' : 'Save Report'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={generatePDF} style={styles.secondaryBtn}>
          <Ionicons name="document-outline" size={20} color="#2563eb" />
          <Text style={styles.secondaryBtnText}>Export PDF Report</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.ghostBtn}>
          <Ionicons name="home-outline" size={18} color="#64748b" />
          <Text style={styles.ghostBtnText}>Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f7fb' },
  container: { padding: 20, paddingBottom: 50 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, marginBottom: 18 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#0f172a', flex: 1 },
  subtitle: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  saveQuickBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  saveQuickBtnDone: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },

  vehicleImage: { width: '100%', height: 210, borderRadius: 24, marginBottom: 16, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 140, borderRadius: 24, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },

  heroCard: { borderRadius: 26, padding: 22, marginBottom: 14 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heroLabel: { fontSize: 11, fontWeight: '900', color: '#bfdbfe', letterSpacing: 1 },
  heroSev: { fontSize: 34, fontWeight: '900', marginTop: 4 },
  scoreBubble: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  scoreBubbleNum: { fontSize: 26, fontWeight: '900', color: '#fff' },
  scoreBubbleSub: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
  heroPills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  heroPillDot: { width: 6, height: 6, borderRadius: 3 },
  heroPillText: { fontSize: 12, fontWeight: '800' },

  card: { backgroundColor: '#fff', borderRadius: 22, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 14 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  infoIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { width: 70, fontSize: 12, fontWeight: '800', color: '#64748b' },
  infoVal: { flex: 1, fontSize: 14, fontWeight: '800', color: '#0f172a' },

  findingsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  findingChip: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  findingKey: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 3 },
  findingVal: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  miniLabel: { fontSize: 12, fontWeight: '900', color: '#475569', marginBottom: 8, marginTop: 4 },
  componentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  componentPill: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  componentText: { fontSize: 12, fontWeight: '800', color: '#2563eb' },
  damageItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  damageDot: { width: 7, height: 7, borderRadius: 4 },
  damageText: { flex: 1, fontSize: 13, color: '#334155', fontWeight: '600' },

  costCard: { borderRadius: 22, padding: 20, marginBottom: 14 },
  costLabel: { fontSize: 12, fontWeight: '900', color: '#bfdbfe' },
  costValue: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 4 },
  costNote: { fontSize: 12, color: '#93c5fd', marginTop: 6, lineHeight: 18 },

  suggestionText: { fontSize: 14, color: '#334155', lineHeight: 22, fontWeight: '600', marginBottom: 12 },
  workshopBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eff6ff', padding: 12, borderRadius: 14 },
  workshopText: { fontSize: 13, fontWeight: '800', color: '#1d4ed8', flex: 1 },

  primaryBtn: { height: 58, borderRadius: 18, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  primaryBtnSaved: { backgroundColor: '#16a34a' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { height: 54, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#dbeafe', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  secondaryBtnText: { color: '#2563eb', fontSize: 15, fontWeight: '900' },
  ghostBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  ghostBtnText: { color: '#64748b', fontSize: 14, fontWeight: '800' },
});