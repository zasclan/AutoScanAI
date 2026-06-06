import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Animated, Image, Modal, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback, View,
} from 'react-native';

type Report = {
  id: string; imageUri?: string; vehicleMake?: string; vehicleModel?: string;
  vehicleYear?: string; vehicleCity?: string; severity?: string; cost?: string;
  damage?: string[]; repairSuggestion?: string; overallScore?: string;
  repairUrgency?: string; date?: string;
};

const COST_DATA: Record<string, Record<string, string>> = {
  'Scratch':           { Gujranwala:'PKR 5,000–14,000',  Lahore:'PKR 7,000–16,000',  Islamabad:'PKR 8,000–18,000',  Karachi:'PKR 9,000–20,000',  Faisalabad:'PKR 6,000–15,000',  Rawalpindi:'PKR 7,500–17,000',  Peshawar:'PKR 5,500–13,000', Multan:'PKR 5,000–12,000'  },
  'Dent + Paint':      { Gujranwala:'PKR 15,000–35,000', Lahore:'PKR 18,000–40,000', Islamabad:'PKR 22,000–45,000', Karachi:'PKR 25,000–50,000', Faisalabad:'PKR 16,000–38,000', Rawalpindi:'PKR 20,000–42,000', Peshawar:'PKR 14,000–32,000',Multan:'PKR 13,000–30,000' },
  'Bumper Repair':     { Gujranwala:'PKR 12,000–28,000', Lahore:'PKR 15,000–32,000', Islamabad:'PKR 18,000–35,000', Karachi:'PKR 20,000–38,000', Faisalabad:'PKR 13,000–30,000', Rawalpindi:'PKR 16,000–33,000', Peshawar:'PKR 11,000–26,000',Multan:'PKR 10,000–24,000' },
  'Glass/Windshield':  { Gujranwala:'PKR 8,000–22,000',  Lahore:'PKR 10,000–25,000', Islamabad:'PKR 12,000–28,000', Karachi:'PKR 13,000–30,000', Faisalabad:'PKR 9,000–23,000',  Rawalpindi:'PKR 11,000–26,000', Peshawar:'PKR 8,000–20,000', Multan:'PKR 7,500–19,000' },
  'Full Respray':      { Gujranwala:'PKR 35,000–80,000', Lahore:'PKR 45,000–95,000', Islamabad:'PKR 55,000–110,000',Karachi:'PKR 60,000–120,000',Faisalabad:'PKR 38,000–85,000', Rawalpindi:'PKR 48,000–98,000', Peshawar:'PKR 32,000–75,000',Multan:'PKR 30,000–70,000' },
};
const ALL_CITIES   = Object.keys(COST_DATA['Scratch']);
const DAMAGE_TYPES = Object.keys(COST_DATA);

const SEV: Record<string,{color:string;bg:string;border:string}> = {
  Minor:    { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  Moderate: { color:'#b45309', bg:'#fef3c7', border:'#fde68a' },
  Severe:   { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
};

export default function HomeScreen() {
  const [reports, setReports]             = useState<Report[]>([]);
  const [guideCity, setGuideCity]         = useState('Gujranwala');
  const [guideDamage, setGuideDamage]     = useState('Dent + Paint');
  const [cityInput, setCityInput]         = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showNotif, setShowNotif]         = useState(false);
  const notifAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('inspectionReports').then(v => setReports(v ? JSON.parse(v) : []));
  }, []));

  const total    = reports.length;
  const minor    = reports.filter(r => r.severity === 'Minor').length;
  const moderate = reports.filter(r => r.severity === 'Moderate').length;
  const severe   = reports.filter(r => r.severity === 'Severe').length;
  const avgScore = () => {
    const s = reports.map(r => parseFloat(r.overallScore||'0')).filter(v=>v>0);
    return s.length ? Math.round(s.reduce((a,b)=>a+b,0)/s.length) : null;
  };
  const avg = avgScore();
  const history = reports.slice(0,6);
  const getCost = () => COST_DATA[guideDamage]?.[guideCity] ?? '—';
  const filteredCities = ALL_CITIES.filter(c=>c.toLowerCase().includes(cityInput.toLowerCase()));

  const openNotif = () => {
    setShowNotif(true);
    Animated.spring(notifAnim,{toValue:1,useNativeDriver:true,tension:90,friction:11}).start();
  };
  const closeNotif = () => {
    Animated.timing(notifAnim,{toValue:0,duration:150,useNativeDriver:true}).start(()=>setShowNotif(false));
  };
  const goReport = (r:Report) => router.push({ pathname:'/result', params:{
    imageUri:r.imageUri, vehicleMake:r.vehicleMake, vehicleModel:r.vehicleModel,
    vehicleYear:r.vehicleYear, vehicleCity:r.vehicleCity, severity:r.severity,
    damage:JSON.stringify(r.damage||[]), estimatedCost:r.cost,
    repairSuggestion:r.repairSuggestion, overallScore:r.overallScore, repairUrgency:r.repairUrgency,
  }});

  return (
    <SafeAreaView style={t.safe}>

      {/* ── NOTIFICATION PANEL ── */}
      {showNotif && (
        <TouchableWithoutFeedback onPress={closeNotif}>
          <View style={t.notifOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[t.notifBox,{
                opacity: notifAnim,
                transform:[{translateY:notifAnim.interpolate({inputRange:[0,1],outputRange:[-10,0]})}],
              }]}>
                <View style={t.notifBoxHeader}>
                  <Text style={t.notifBoxTitle}>Notifications</Text>
                  <TouchableOpacity onPress={closeNotif} style={t.notifBoxClose}>
                    <Ionicons name="close" size={16} color="#6b7280"/>
                  </TouchableOpacity>
                </View>
                {reports.length===0 ? (
                  <View style={t.notifBoxEmpty}>
                    <Ionicons name="notifications-off-outline" size={32} color="#d1d5db"/>
                    <Text style={t.notifBoxEmptyTxt}>No inspections yet</Text>
                  </View>
                ):(
                  <ScrollView style={{maxHeight:300}} showsVerticalScrollIndicator={false}>
                    {reports.slice(0,8).map((r,i)=>{
                      const nm = `${r.vehicleMake||''} ${r.vehicleModel||''}`.trim()||'Vehicle';
                      const sv = SEV[r.severity||'']||SEV['Moderate'];
                      return (
                        <TouchableOpacity key={r.id} style={t.notifItem}
                          onPress={()=>{closeNotif();goReport(r);}}>
                          <View style={[t.notifItemDot,{backgroundColor:sv.color}]}/>
                          <View style={{flex:1}}>
                            <Text style={t.notifItemName}>{i===0?'New  ':''}{nm}</Text>
                            <Text style={t.notifItemSub}>{r.date||'Recent'} · {r.severity||'—'}</Text>
                          </View>
                          <Text style={[t.notifItemSev,{color:sv.color}]}>{r.cost||''}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
                {reports.length>0 && (
                  <TouchableOpacity style={t.notifSeeAll} onPress={()=>{closeNotif();router.push('/reports');}}>
                    <Text style={t.notifSeeAllTxt}>View all reports</Text>
                    <Ionicons name="arrow-forward" size={13} color="#2563eb"/>
                  </TouchableOpacity>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* ── CITY MODAL ── */}
      <Modal visible={showCityModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={()=>setShowCityModal(false)}>
          <View style={t.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={t.modalSheet}>
                <View style={t.modalHandle}/>
                <Text style={t.modalTitle}>Select City</Text>
                <View style={t.modalSearch}>
                  <Ionicons name="search-outline" size={16} color="#9ca3af"/>
                  <TextInput style={t.modalSearchInput} placeholder="Search..."
                    placeholderTextColor="#9ca3af" value={cityInput}
                    onChangeText={setCityInput} autoFocus/>
                  {cityInput.length>0 &&
                    <TouchableOpacity onPress={()=>setCityInput('')}>
                      <Ionicons name="close-circle" size={16} color="#9ca3af"/>
                    </TouchableOpacity>}
                </View>
                <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight:340}}>
                  {filteredCities.map(c=>(
                    <TouchableOpacity key={c} style={[t.cityRow, guideCity===c && t.cityRowSel]}
                      onPress={()=>{setGuideCity(c);setCityInput('');setShowCityModal(false);}}>
                      <Ionicons name={guideCity===c?'location':'location-outline'} size={16}
                        color={guideCity===c?'#2563eb':'#9ca3af'}/>
                      <Text style={[t.cityRowTxt, guideCity===c && t.cityRowTxtSel]}>{c}</Text>
                      {guideCity===c && <Ionicons name="checkmark" size={16} color="#2563eb"/>}
                    </TouchableOpacity>
                  ))}
                  {filteredCities.length===0 &&
                    <Text style={t.cityNone}>No city matching "{cityInput}"</Text>}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={t.scroll}>

        {/* ════════════════════════════════════════
            ZONE 1 — HEADER
        ════════════════════════════════════════ */}
        <View style={t.header}>
          <View>
            <Text style={t.headerEye}>DASHBOARD</Text>
            <Text style={t.headerTitle}>AutoScan AI</Text>
          </View>
          <TouchableOpacity style={t.bellBtn} onPress={openNotif}>
            <Ionicons name="notifications-outline" size={20} color="#374151"/>
            {reports.length>0 && (
              <View style={t.bellBadge}>
                <Text style={t.bellBadgeTxt}>{reports.length>9?'9+':reports.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ════════════════════════════════════════
            ZONE 2 — HERO CTA
        ════════════════════════════════════════ */}
        <LinearGradient colors={['#1e3a8a','#1d4ed8']}
          start={{x:0,y:0}} end={{x:1,y:1}} style={t.hero}>
          <View style={t.heroLeft}>
            <View style={t.heroChip}>
              <View style={t.heroChipDot}/>
              <Text style={t.heroChipTxt}>Groq AI Vision</Text>
            </View>
            <Text style={t.heroH1}>
Smart Vehicle{'\n'}Inspection
</Text>

<Text style={t.heroP}>
Upload a photo and receive a complete AI-powered damage assessment.
</Text>
          </View>
          <TouchableOpacity style={t.heroBtn} onPress={()=>router.push('/inspect')} activeOpacity={0.9}>
            <Ionicons name="scan-outline" size={16} color="#1d4ed8"/>
            <Text style={t.heroBtnTxt}>Inspect</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ════════════════════════════════════════
            ZONE 3 — STATS BLOCK
        ════════════════════════════════════════ */}
        <Text style={t.zoneLabel}>OVERVIEW</Text>
        <View style={t.statsBlock}>

          {/* Row 1 — big number + score ring */}
          <View style={t.statsTopRow}>
            <View style={t.statsBigBox}>
              <Text style={t.statsBigEye}>TOTAL INSPECTIONS</Text>
              <Text style={t.statsBigNum}>{total}</Text>
              <Text style={t.statsBigSub}>
                {total===0 ? 'Start your first scan' : `Last: ${reports[0]?.date||'—'}`}
              </Text>
            </View>
            <View style={t.statsRingBox}>
              <View style={[t.statsRing, avg!==null && {borderColor:'#dbeafe'}]}>
                <Text style={t.statsRingNum}>{avg!==null?avg:'—'}</Text>
                <Text style={t.statsRingLbl}>avg{'\n'}score</Text>
              </View>
            </View>
          </View>

          {/* Thin divider */}
          <View style={t.statsDivider}/>

          {/* Row 2 — severity breakdown */}
          <View style={t.sevRow}>
            {[
              {label:'Minor',    val:minor,    ...SEV['Minor']},
              {label:'Moderate', val:moderate, ...SEV['Moderate']},
              {label:'Severe',   val:severe,   ...SEV['Severe']},
            ].map((item,i)=>(
              <View key={item.label} style={[
                t.sevItem,
                {borderColor:item.border, backgroundColor:item.bg},
                i===1 && {marginHorizontal:8},
              ]}>
                <Text style={[t.sevNum,{color:item.color}]}>{item.val}</Text>
                <View style={t.sevLabelRow}>
                  <View style={[t.sevDot,{backgroundColor:item.color}]}/>
                  <Text style={[t.sevLbl,{color:item.color}]}>{item.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ════════════════════════════════════════
            ZONE 4 — RECENT HISTORY
        ════════════════════════════════════════ */}
        <View style={t.zoneHeader}>
          <Text style={t.zoneLabel}>RECENT HISTORY</Text>
          {reports.length>0 &&
            <TouchableOpacity onPress={()=>router.push('/reports')}>
              <Text style={t.zoneLink}>See all</Text>
            </TouchableOpacity>}
        </View>

        {history.length===0 ? (
          <View style={t.emptyCard}>
            <View style={t.emptyCardIcon}>
              <Ionicons name="time-outline" size={24} color="#2563eb"/>
            </View>
            <View style={{flex:1}}>
              <Text style={t.emptyCardTitle}>No inspections yet</Text>
              <Text style={t.emptyCardSub}>Past scans will appear here.</Text>
            </View>
            <TouchableOpacity style={t.emptyCardBtn} onPress={()=>router.push('/inspect')}>
              <Text style={t.emptyCardBtnTxt}>Start →</Text>
            </TouchableOpacity>
          </View>
        ):(
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{marginHorizontal:-20}} contentContainerStyle={{paddingHorizontal:20,gap:10}}>
            {history.map((r,i)=>{
              const nm  = `${r.vehicleMake||''} ${r.vehicleModel||''}`.trim()||'Vehicle';
              const sv  = SEV[r.severity||'']||SEV['Moderate'];
              const sc  = r.overallScore ? parseInt(r.overallScore) : null;
              return (
                <TouchableOpacity key={r.id} style={t.histCard} onPress={()=>goReport(r)} activeOpacity={0.85}>
                  {r.imageUri
                    ? <Image source={{uri:r.imageUri}} style={t.histImg}/>
                    : <View style={[t.histImg,t.histImgFallback]}>
                        <Ionicons name="car-outline" size={24} color="#d1d5db"/>
                      </View>}
                  {i===0 && <View style={t.histNewBadge}><Text style={t.histNewTxt}>LATEST</Text></View>}
                  {sc!==null && <View style={t.histScoreBadge}><Text style={t.histScoreTxt}>{sc}%</Text></View>}
                  <View style={t.histMeta}>
                    <Text style={t.histName} numberOfLines={1}>{nm}</Text>
                    <Text style={t.histDate}>{r.date||'—'}</Text>
                    <View style={[t.histSev,{backgroundColor:sv.bg,borderColor:sv.border}]}>
                      <View style={[t.histSevDot,{backgroundColor:sv.color}]}/>
                      <Text style={[t.histSevTxt,{color:sv.color}]}>{r.severity||'—'}</Text>
                    </View>
                    <Text style={t.histCost} numberOfLines={1}>{r.cost||'—'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ════════════════════════════════════════
            ZONE 5 — REPAIR COST GUIDE
        ════════════════════════════════════════ */}
        <View style={t.zoneHeader}>
          <Text style={t.zoneLabel}>REPAIR COST GUIDE</Text>
        </View>

        <View style={t.guideCard}>
          {/* City selector */}
          <View style={t.guideFieldRow}>
            <Text style={t.guideFieldLabel}>City</Text>
            <TouchableOpacity style={t.guideCityBtn} onPress={()=>setShowCityModal(true)}>
              <Ionicons name="location-outline" size={14} color="#2563eb"/>
              <Text style={t.guideCityTxt}>{guideCity}</Text>
              <Ionicons name="chevron-down" size={13} color="#9ca3af"/>
            </TouchableOpacity>
          </View>

          <View style={t.guideSep}/>

          {/* Damage chips */}
          <Text style={t.guideFieldLabel}>Damage Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{gap:7,paddingTop:8,paddingBottom:2}}>
            {DAMAGE_TYPES.map(d=>(
              <TouchableOpacity key={d} style={[t.guideChip, guideDamage===d && t.guideChipOn]}
                onPress={()=>setGuideDamage(d)}>
                <Text style={[t.guideChipTxt, guideDamage===d && t.guideChipTxtOn]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cost output */}
          <View style={t.guideSep}/>
          <View style={t.costOut}>
            <View>
              <Text style={t.costOutLabel}>{guideDamage} in {guideCity}</Text>
              <Text style={t.costOutVal}>{getCost()}</Text>
            </View>
            <View style={t.costOutBadge}>
              <Text style={t.costOutBadgeTxt}>PKR</Text>
            </View>
          </View>
          <Text style={t.costOutNote}>Local estimate only. Use AI scan for a precise figure.</Text>
        </View>

        {/* ════════════════════════════════════════
            ZONE 6 — HOW IT WORKS
        ════════════════════════════════════════ */}
        <View style={t.zoneHeader}>
          <Text style={t.zoneLabel}>HOW IT WORKS</Text>
        </View>
        <View style={t.howCard}>
          {[
            {n:'01', icon:'camera-outline',        col:'#2563eb', bg:'#eff6ff', title:'Capture',     desc:'Take or upload a photo of the damaged area.'},
            {n:'02', icon:'sparkles-outline',      col:'#7c3aed', bg:'#f5f3ff', title:'AI Analysis', desc:'Groq detects damage type, severity & components.'},
            {n:'03', icon:'document-text-outline', col:'#059669', bg:'#ecfdf5', title:'Full Report',  desc:'PKR cost estimate, urgency rating & PDF export.'},
          ].map((s,i)=>(
            <View key={s.n}>
              <View style={t.howRow}>
                <Text style={t.howN}>{s.n}</Text>
                <View style={[t.howIconBox,{backgroundColor:s.bg}]}>
                  <Ionicons name={s.icon as any} size={18} color={s.col}/>
                </View>
                <View style={{flex:1}}>
                  <Text style={t.howTitle}>{s.title}</Text>
                  <Text style={t.howDesc}>{s.desc}</Text>
                </View>
              </View>
              {i<2 && <View style={t.howSep}/>}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────────────────────
   STYLES — Linear/Notion: white bg, precise spacing,
   clear type hierarchy, restrained color
───────────────────────────────────────────────────────── */
const t = StyleSheet.create({
  safe:   { flex:1, backgroundColor:'#f9fafb' },
  scroll: { paddingHorizontal:20, paddingTop:54, paddingBottom:110 },

  /* ── Header ── */
  header:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  headerEye:   { fontSize:10, fontWeight:'800', color:'#9ca3af', letterSpacing:1.5 },
  headerTitle: { fontSize:28, fontWeight:'900', color:'#111827', letterSpacing:-0.5, marginTop:1 },
  bellBtn:     { width:40, height:40, borderRadius:10, backgroundColor:'#ffffff',
    borderWidth:1, borderColor:'#e5e7eb', alignItems:'center', justifyContent:'center' },
  bellBadge:   { position:'absolute', top:6, right:6, minWidth:15, height:15, borderRadius:8,
    backgroundColor:'#ef4444', alignItems:'center', justifyContent:'center',
    paddingHorizontal:2, borderWidth:1.5, borderColor:'#f9fafb' },
  bellBadgeTxt:{ color:'#fff', fontSize:8, fontWeight:'900' },

  /* ── Notification panel ── */
  notifOverlay: { ...StyleSheet.absoluteFillObject, zIndex:99 },
  notifBox: {
    position:'absolute', top:68, left:14, right:14, zIndex:100,
    backgroundColor:'#ffffff', borderRadius:16,
    borderWidth:1, borderColor:'#e5e7eb',
    shadowColor:'#111827', shadowOpacity:0.10, shadowOffset:{width:0,height:8}, shadowRadius:20, elevation:14,
    overflow:'hidden',
  },
  notifBoxHeader:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    paddingHorizontal:16, paddingVertical:13, borderBottomWidth:1, borderBottomColor:'#f3f4f6' },
  notifBoxTitle:    { fontSize:14, fontWeight:'800', color:'#111827' },
  notifBoxClose:    { width:26, height:26, borderRadius:7, backgroundColor:'#f9fafb',
    alignItems:'center', justifyContent:'center' },
  notifBoxEmpty:    { padding:28, alignItems:'center', gap:8 },
  notifBoxEmptyTxt: { fontSize:13, color:'#9ca3af', fontWeight:'600' },
  notifItem:        { flexDirection:'row', alignItems:'center', gap:10,
    paddingHorizontal:16, paddingVertical:11, borderBottomWidth:1, borderBottomColor:'#f9fafb' },
  notifItemDot:     { width:7, height:7, borderRadius:4 },
  notifItemName:    { fontSize:13, fontWeight:'700', color:'#111827' },
  notifItemSub:     { fontSize:11, color:'#9ca3af', fontWeight:'500', marginTop:1 },
  notifItemSev:     { fontSize:11, fontWeight:'700' },
  notifSeeAll:      { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5,
    paddingVertical:12, borderTopWidth:1, borderTopColor:'#f3f4f6' },
  notifSeeAllTxt:   { fontSize:13, fontWeight:'700', color:'#2563eb' },

  /* ── City modal ── */
  modalOverlay: { flex:1, backgroundColor:'rgba(17,24,39,0.4)', justifyContent:'flex-end' },
  modalSheet:   { backgroundColor:'#ffffff', borderTopLeftRadius:24, borderTopRightRadius:24,
    paddingHorizontal:20, paddingTop:12, paddingBottom:44 },
  modalHandle:  { width:36, height:3, backgroundColor:'#e5e7eb', borderRadius:2, alignSelf:'center', marginBottom:18 },
  modalTitle:   { fontSize:18, fontWeight:'800', color:'#111827', marginBottom:14 },
  modalSearch:  { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#f3f4f6',
    borderRadius:12, paddingHorizontal:12, paddingVertical:10, marginBottom:8 },
  modalSearchInput: { flex:1, fontSize:14, color:'#111827', fontWeight:'500' },
  cityRow:      { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:12,
    borderBottomWidth:1, borderBottomColor:'#f9fafb' },
  cityRowSel:   { backgroundColor:'#eff6ff', borderRadius:10, paddingHorizontal:8 },
  cityRowTxt:   { flex:1, fontSize:15, fontWeight:'600', color:'#374151' },
  cityRowTxtSel:{ color:'#1d4ed8', fontWeight:'800' },
  cityNone:     { textAlign:'center', color:'#9ca3af', fontSize:13, paddingVertical:24 },

  /* ── Hero ── */
  hero:        { borderRadius:20, padding:22, marginBottom:24 },
  heroLeft:    { marginBottom:20 },
  heroChip:    { flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start',
    backgroundColor:'rgba(255,255,255,0.12)', paddingHorizontal:10, paddingVertical:4,
    borderRadius:20, marginBottom:14 },
  heroChipDot: { width:6, height:6, borderRadius:3, backgroundColor:'#93c5fd' },
  heroChipTxt: { fontSize:10, color:'#bfdbfe', fontWeight:'800', letterSpacing:0.5 },
  heroH1:      { fontSize:26, fontWeight:'900', color:'#ffffff', lineHeight:32, marginBottom:8 },
  heroP:       { fontSize:13, color:'#bfdbfe', fontWeight:'500', lineHeight:19 },
  heroBtn:     { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:7,
    backgroundColor:'#ffffff', borderRadius:12, paddingVertical:13 },
  heroBtnTxt:  { fontSize:15, fontWeight:'800', color:'#1d4ed8' },

  /* ── Zone labels ── */
  zoneLabel:  { fontSize:10, fontWeight:'800', color:'#9ca3af', letterSpacing:1.5, marginBottom:10 },
  zoneHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    marginTop:28, marginBottom:10 },
  zoneLink:   { fontSize:12, fontWeight:'700', color:'#2563eb' },

  /* ── Stats block ── */
  statsBlock: {
    backgroundColor:'#ffffff', borderRadius:20, padding:20,
    borderWidth:1, borderColor:'#e5e7eb',
    shadowColor:'#111827', shadowOpacity:0.04, shadowOffset:{width:0,height:2}, shadowRadius:8, elevation:2,
  },
  statsTopRow:  { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 },
  statsBigBox:  { flex:1 },
  statsBigEye:  { fontSize:9, fontWeight:'800', color:'#9ca3af', letterSpacing:1.5 },
  statsBigNum:  { fontSize:56, fontWeight:'900', color:'#111827', lineHeight:62, marginTop:2 },
  statsBigSub:  { fontSize:12, color:'#9ca3af', fontWeight:'500' },
  statsRingBox: { paddingTop:4 },
  statsRing: {
    width:80, height:80, borderRadius:40,
    borderWidth:3, borderColor:'#e5e7eb',
    backgroundColor:'#f9fafb',
    alignItems:'center', justifyContent:'center',
  },
  statsRingNum: { fontSize:22, fontWeight:'900', color:'#1d4ed8', lineHeight:26 },
  statsRingLbl: { fontSize:9, color:'#9ca3af', fontWeight:'700', textAlign:'center', lineHeight:12 },
  statsDivider: { height:1, backgroundColor:'#f3f4f6', marginBottom:16 },
  sevRow:       { flexDirection:'row' },
  sevItem:      { flex:1, borderRadius:14, paddingVertical:14, alignItems:'center', gap:6, borderWidth:1 },
  sevNum:       { fontSize:26, fontWeight:'900', lineHeight:30 },
  sevLabelRow:  { flexDirection:'row', alignItems:'center', gap:4 },
  sevDot:       { width:6, height:6, borderRadius:3 },
  sevLbl:       { fontSize:10, fontWeight:'800', textTransform:'uppercase', letterSpacing:0.5 },

  /* ── Empty card ── */
  emptyCard:     { backgroundColor:'#ffffff', borderRadius:16, padding:16, flexDirection:'row',
    alignItems:'center', gap:12, borderWidth:1, borderColor:'#e5e7eb' },
  emptyCardIcon: { width:44, height:44, borderRadius:12, backgroundColor:'#eff6ff',
    alignItems:'center', justifyContent:'center' },
  emptyCardTitle:{ fontSize:14, fontWeight:'700', color:'#111827' },
  emptyCardSub:  { fontSize:12, color:'#9ca3af', fontWeight:'500', marginTop:2 },
  emptyCardBtn:  { backgroundColor:'#111827', paddingHorizontal:14, paddingVertical:8, borderRadius:9 },
  emptyCardBtnTxt:{ fontSize:12, fontWeight:'700', color:'#ffffff' },

  /* ── History cards ── */
  histCard: {
    width:148, backgroundColor:'#ffffff', borderRadius:16, overflow:'hidden',
    borderWidth:1, borderColor:'#e5e7eb',
  },
  histImg:         { width:'100%', height:90, resizeMode:'cover' },
  histImgFallback: { backgroundColor:'#f3f4f6', alignItems:'center', justifyContent:'center' },
  histNewBadge:    { position:'absolute', top:8, left:8, backgroundColor:'#111827',
    paddingHorizontal:6, paddingVertical:2, borderRadius:5 },
  histNewTxt:      { fontSize:8, fontWeight:'900', color:'#ffffff', letterSpacing:0.8 },
  histScoreBadge:  { position:'absolute', top:8, right:8, backgroundColor:'rgba(0,0,0,0.5)',
    paddingHorizontal:6, paddingVertical:2, borderRadius:5 },
  histScoreTxt:    { fontSize:9, fontWeight:'800', color:'#ffffff' },
  histMeta:        { padding:10, gap:3 },
  histName:        { fontSize:12, fontWeight:'700', color:'#111827' },
  histDate:        { fontSize:10, color:'#9ca3af', fontWeight:'500' },
  histSev:         { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:6,
    paddingVertical:3, borderRadius:6, alignSelf:'flex-start', marginTop:3, borderWidth:1 },
  histSevDot:      { width:4, height:4, borderRadius:2 },
  histSevTxt:      { fontSize:9, fontWeight:'800' },
  histCost:        { fontSize:11, fontWeight:'700', color:'#374151', marginTop:2 },

  /* ── Cost guide ── */
  guideCard: {
    backgroundColor:'#ffffff', borderRadius:20, padding:18,
    borderWidth:1, borderColor:'#e5e7eb',
    shadowColor:'#111827', shadowOpacity:0.04, shadowOffset:{width:0,height:2}, shadowRadius:8, elevation:2,
  },
  guideFieldRow:  { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  guideFieldLabel:{ fontSize:12, fontWeight:'700', color:'#6b7280' },
  guideCityBtn:   { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'#eff6ff',
    paddingHorizontal:12, paddingVertical:7, borderRadius:10 },
  guideCityTxt:   { fontSize:13, fontWeight:'800', color:'#1d4ed8' },
  guideSep:       { height:1, backgroundColor:'#f3f4f6', marginVertical:14 },
  guideChip:      { backgroundColor:'#f3f4f6', paddingHorizontal:12, paddingVertical:7, borderRadius:9 },
  guideChipOn:    { backgroundColor:'#1d4ed8', paddingHorizontal:12, paddingVertical:7, borderRadius:9 },
  guideChipTxt:   { fontSize:12, fontWeight:'700', color:'#6b7280' },
  guideChipTxtOn: { color:'#ffffff', fontWeight:'800' },
  costOut:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  costOutLabel:   { fontSize:11, color:'#9ca3af', fontWeight:'600', marginBottom:3 },
  costOutVal:     { fontSize:22, fontWeight:'900', color:'#111827' },
  costOutBadge:   { backgroundColor:'#eff6ff', paddingHorizontal:10, paddingVertical:5, borderRadius:8 },
  costOutBadgeTxt:{ fontSize:12, fontWeight:'900', color:'#1d4ed8' },
  costOutNote:    { fontSize:11, color:'#9ca3af', fontWeight:'500', marginTop:10, lineHeight:16 },

  /* ── How it works ── */
  howCard: { backgroundColor:'#ffffff', borderRadius:20, overflow:'hidden',
    borderWidth:1, borderColor:'#e5e7eb' },
  howRow:    { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:18, paddingVertical:16 },
  howSep:    { height:1, backgroundColor:'#f9fafb', marginHorizontal:18 },
  howN:      { fontSize:11, fontWeight:'800', color:'#d1d5db', width:22 },
  howIconBox:{ width:38, height:38, borderRadius:11, alignItems:'center', justifyContent:'center' },
  howTitle:  { fontSize:13, fontWeight:'800', color:'#111827', marginBottom:2 },
  howDesc:   { fontSize:12, color:'#6b7280', fontWeight:'500', lineHeight:17 },
});