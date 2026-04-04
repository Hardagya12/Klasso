import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import {
  KlassoAvatar, KlassoBadge, KlassoButton,
  DoodleArrow, DoodleBook, DoodleStar, DoodleRocket,
  DoodleCheckCircle, DoodleSparkle,
  DoodleCircleDot,
  Colors, Fonts, retroShadow, Radius,
} from '@/src/components';
import { useAuth } from '@/contexts/AuthContext';
import { apiData } from '@/lib/api';

// ─── Gear SVG ────────────────────────────────────────────────────────────────
const DoodleGear = ({ size = 28, color = Colors.mint }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path
      d="M20 4l2 4h4l2-4 4 2-1 4 3 3 4-1 2 4-4 2v4l4 2-2 4-4-1-3 3 1 4-4 2-2-4h-4l-2 4-4-2 1-4-3-3-4 1-2-4 4-2v-4l-4-2 2-4 4 1 3-3-1-4z"
      fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.6} strokeLinejoin="round"
    />
    <Circle cx={20} cy={20} r={6} fill={color} fillOpacity={0.4} stroke={color} strokeWidth={1.5} />
  </Svg>
);

// ─── School Building illustration ────────────────────────────────────────────
const SchoolBuilding = () => (
  <View style={styles.footerScene}>
    <Svg width={200} height={110} viewBox="0 0 200 110" fill="none">
      {/* Ground */}
      <Path d="M0 105 Q100 98 200 105" stroke={Colors.mint} strokeWidth={1.5} fill="none" opacity={0.4} />

      {/* Flowers */}
      <Circle cx={20} cy={90} r={6} fill={Colors.yellow} fillOpacity={0.8} stroke={Colors.yellow} strokeWidth={1} />
      <Circle cx={14} cy={86} r={4} fill={Colors.yellow} fillOpacity={0.6} />
      <Circle cx={26} cy={86} r={4} fill={Colors.yellow} fillOpacity={0.6} />
      <Path d="M20 96 L20 105" stroke={Colors.mint} strokeWidth={2} strokeLinecap="round" />

      <Circle cx={180} cy={90} r={6} fill={Colors.coral} fillOpacity={0.7} stroke={Colors.coral} strokeWidth={1} />
      <Circle cx={174} cy={86} r={4} fill={Colors.coral} fillOpacity={0.5} />
      <Circle cx={186} cy={86} r={4} fill={Colors.coral} fillOpacity={0.5} />
      <Path d="M180 96 L180 105" stroke={Colors.mint} strokeWidth={2} strokeLinecap="round" />

      {/* Building body */}
      <Rect x={55} y={50} width={90} height={55} rx={2} fill={Colors.mintLight} stroke={Colors.mint} strokeWidth={1.8} />

      {/* Roof (triangle) */}
      <Polygon points="45,52 100,12 155,52" fill={Colors.mint} fillOpacity={0.6} stroke={Colors.mintDark} strokeWidth={1.5} strokeLinejoin="round" />

      {/* Door */}
      <Rect x={87} y={75} width={26} height={30} rx={3} fill="white" stroke={Colors.mint} strokeWidth={1.4} />
      <Circle cx={110} cy={90} r={2} fill={Colors.mint} />

      {/* Windows */}
      <Rect x={62} y={58} width={22} height={18} rx={2} fill="white" stroke={Colors.mint} strokeWidth={1.2} />
      <Path d="M73 58 L73 76M62 67 L84 67" stroke={Colors.mint} strokeWidth={0.8} />

      <Rect x={116} y={58} width={22} height={18} rx={2} fill="white" stroke={Colors.mint} strokeWidth={1.2} />
      <Path d="M127 58 L127 76M116 67 L138 67" stroke={Colors.mint} strokeWidth={0.8} />

      {/* Star above */}
      <Polygon points="100,2 102,8 108,8 103,12 105,18 100,14 95,18 97,12 92,8 98,8"
        fill={Colors.yellow} stroke={Colors.yellow} strokeWidth={0.5} />

      {/* Flag on top */}
      <Path d="M100 12 L100 4" stroke={Colors.coral} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M100 4 L108 6 L100 8" fill={Colors.coral} stroke={Colors.coral} strokeWidth={0.8} />
    </Svg>
    <Text style={styles.footerText}>Made with ♥ for teachers &amp; parents</Text>
  </View>
);

// ─── Custom Toggle ────────────────────────────────────────────────────────────
const KlassoToggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <TouchableOpacity
    onPress={() => onChange(!value)}
    activeOpacity={0.8}
    style={[styles.toggleTrack, { backgroundColor: value ? Colors.mint : Colors.border }]}
  >
    <View style={[styles.toggleThumb, { left: value ? 22 : 2 }]}>
      <DoodleCircleDot size={12} color={value ? Colors.mint : Colors.textLight} />
    </View>
  </TouchableOpacity>
);

// ─── Section Card ────────────────────────────────────────────────────────────
const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.sectionWrap}>
    <Text style={styles.sectionLabel}>{title}</Text>
    <View style={[styles.sectionCard, retroShadow(3, 3, Colors.shadow)]}>
      {children}
    </View>
  </View>
);

// ─── Row ─────────────────────────────────────────────────────────────────────
const SettingsRow = ({
  icon, label, right, onPress, noBorder,
}: {
  icon?: React.ReactNode; label: string;
  right?: React.ReactNode; onPress?: () => void; noBorder?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={[styles.settingsRow, noBorder && { borderBottomWidth: 0 }]}
  >
    {icon && <View style={styles.rowIcon}>{icon}</View>}
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowRight}>{right ?? <DoodleArrow size={14} color={Colors.textLight} />}</View>
  </TouchableOpacity>
);

// ─── Toggle Row ───────────────────────────────────────────────────────────────
const ToggleRow = ({
  icon, label, value, onChange, noBorder,
}: {
  icon?: React.ReactNode; label: string;
  value: boolean; onChange: (v: boolean) => void; noBorder?: boolean;
}) => (
  <View style={[styles.settingsRow, noBorder && { borderBottomWidth: 0 }]}>
    {icon && <View style={styles.rowIcon}>{icon}</View>}
    <Text style={styles.rowLabel}>{label}</Text>
    <KlassoToggle value={value} onChange={onChange} />
  </View>
);

// ─── Data ────────────────────────────────────────────────────────────────────
const CHILDREN = [
  { id: '1', name: 'Arjun Mehta', class: 'Class 9 · A', primary: true },
  { id: '2', name: 'Priya Mehta', class: 'Class 6 · B', primary: false },
];

const NOTIF_TOGGLES = [
  { id: 'attendance', label: 'Attendance Alerts', icon: <DoodleCheckCircle size={16} color={Colors.mint} /> },
  { id: 'grades', label: 'Grade Updates', icon: <DoodleStar size={16} color={Colors.yellow} /> },
  { id: 'homework', label: 'Homework Reminders', icon: <DoodleBook size={16} color={Colors.mint} /> },
  { id: 'messages', label: 'Teacher Messages', icon: <DoodleSparkle size={16} color={Colors.purple} /> },
  { id: 'fees', label: 'Fee Reminders', icon: <DoodleRocket size={16} color={Colors.coral} /> },
];

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function Settings() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    attendance: true, grades: true, homework: false, messages: true, fees: true,
  });

  React.useEffect(() => {
    apiData<{ children: any[] }>('/api/analytics/parent')
      .then(res => setChildrenList(res?.children || []))
      .catch(console.error);
  }, []);

  const toggle = (id: string) =>
    setNotifToggles(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <DoodleGear size={28} color={Colors.mint} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile section */}
        <View style={styles.profileSection}>
          <KlassoAvatar name={user?.name || 'Parent'} size={60} />
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'parent@klasso.app'}</Text>
        </View>

        {/* ── Section 1: My Children ── */}
        <SectionCard title="My Children">
          {childrenList.map((childNode, i) => (
            <SettingsRow
              key={childNode.student?.id}
              icon={<KlassoAvatar name={childNode.student?.name} size={32} />}
              label={childNode.student?.name}
              noBorder={i === childrenList.length - 1}
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {i === 0 && <KlassoBadge label="Primary" color="mint" />}
                  <DoodleArrow size={14} color={Colors.textLight} />
                </View>
              }
            />
          ))}
          {/* Add child */}
          <TouchableOpacity style={styles.addChildBtn} activeOpacity={0.8}>
            <DoodleSparkle size={20} color={Colors.mint} />
            <Text style={styles.addChildText}>Add Child</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Section 2: Notifications ── */}
        <SectionCard title="Notifications">
          {NOTIF_TOGGLES.map((n, i) => (
            <ToggleRow
              key={n.id}
              icon={n.icon}
              label={n.label}
              value={notifToggles[n.id]}
              onChange={() => toggle(n.id)}
              noBorder={i === NOTIF_TOGGLES.length - 1}
            />
          ))}
        </SectionCard>

        {/* ── Section 3: Account ── */}
        <SectionCard title="Account">
          <SettingsRow label="Edit Profile" icon={<DoodleSparkle size={16} color={Colors.mint} />} />
          <SettingsRow label="Change Password" icon={<DoodleStar size={16} color={Colors.yellow} />} />
          <SettingsRow label="Language" icon={<DoodleBook size={16} color={Colors.purple} />}
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.settingValue}>English</Text>
                <DoodleArrow size={14} color={Colors.textLight} />
              </View>
            }
          />
          <SettingsRow label="Linked School" icon={<DoodleCheckCircle size={16} color={Colors.mint} />}
            noBorder
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.settingValue}>Delhi Public School</Text>
                <DoodleArrow size={14} color={Colors.textLight} />
              </View>
            }
          />
        </SectionCard>

        {/* ── Section 4: About ── */}
        <SectionCard title="About Klasso">
          <SettingsRow
            icon={<DoodleRocket size={20} color={Colors.coral} />}
            label="App Version 1.0.0"
            right={<KlassoBadge label="Latest" color="mint" />}
          />
          <SettingsRow
            icon={<DoodleStar size={20} color={Colors.yellow} />}
            label="Rate Klasso ⭐"
          />
          <SettingsRow
            icon={<DoodleBook size={20} color={Colors.mint} />}
            label="Help & FAQs"
            noBorder
          />
        </SectionCard>

        {/* Logout */}
        <View style={styles.logoutWrap}>
          <KlassoButton
            label="Log out"
            variant="coral"
            size="lg"
            onPress={logout}
            style={{ alignSelf: 'stretch' }}
          />
        </View>

        {/* Decorative Footer */}
        <SchoolBuilding />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.textPrimary },

  scroll: { paddingHorizontal: 18, paddingTop: 8 },

  profileSection: {
    alignItems: 'center', paddingVertical: 24, gap: 6,
  },
  profileName: { fontFamily: Fonts.headingXB, fontSize: 20, color: Colors.textPrimary, marginTop: 4 },
  profileEmail: { fontFamily: Fonts.accent, fontSize: 15, color: Colors.textMuted },

  // Section card
  sectionWrap: { marginBottom: 20 },
  sectionLabel: {
    fontFamily: Fonts.heading, fontSize: 13, color: Colors.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden',
  },

  // Row
  settingsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.bg,
    gap: 12,
  },
  rowIcon: { width: 28, alignItems: 'center' },
  rowLabel: { flex: 1, fontFamily: Fonts.body, fontSize: 15, color: Colors.textPrimary },
  rowRight: { alignItems: 'center', justifyContent: 'center' },
  settingValue: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textMuted },

  // Add child button
  addChildBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    margin: 12,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.mint,
    borderRadius: Radius.md, paddingVertical: 12,
  },
  addChildText: { fontFamily: Fonts.accent, fontSize: 16, color: Colors.mint },

  // Toggle
  toggleTrack: {
    width: 44, height: 24, borderRadius: 12, position: 'relative',
  },
  toggleThumb: {
    position: 'absolute', top: 4, width: 18, height: 18,
    borderRadius: 9, backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.shadow, shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3, shadowRadius: 2, elevation: 2,
  },

  // Logout
  logoutWrap: { marginBottom: 24 },

  // Footer scene
  footerScene: { alignItems: 'center', marginTop: 8, marginBottom: 8 },
  footerText: {
    fontFamily: Fonts.accent, fontSize: 13, color: Colors.textMuted, marginTop: 8,
  },
});
