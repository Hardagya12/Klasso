import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { apiData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PTMSlot {
  id: string;
  ptmEventId: string;
  scheduledAt: string;
  duration: number;
  status: 'CONFIRMED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  summary: string | null;
  teacher: {
    name: string;
  };
  student: {
    firstName: string;
  };
}

const SparkleSvg = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={styles.doodleSVG}>
    <Path d="M12 2C12 2 12 10 20 12C12 14 12 22 12 22C12 22 12 14 4 12C12 10 12 2 12 2Z" fill="#3ECFB2" />
  </Svg>
);

const CalendarSvg = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M16 2V6M8 2V6M3 10H21" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function PTMScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED'>('UPCOMING');
  const [slots, setSlots] = useState<PTMSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchSlots();
  }, [user]);

  const fetchSlots = async () => {
    try {
      if (!user?.id) return;
      const res = await apiData<PTMSlot[]>(`/api/ptm/parent/${user.id}`);
      setSlots(res || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleAddToCalendar = (slot: PTMSlot) => {
    Alert.alert('Calendar', `Meeting with ${slot.teacher.name} has been added to your device calendar!`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3ECFB2" />
      </View>
    );
  }

  const upcomingSlots = slots.filter(s => s.status === 'CONFIRMED');
  const completedSlots = slots.filter(s => s.status === 'COMPLETED');

  const displaySlots = activeTab === 'UPCOMING' ? upcomingSlots : completedSlots;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parent-Teacher Meetings</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'UPCOMING' && styles.tabActive]}
          onPress={() => setActiveTab('UPCOMING')}
        >
          <Text style={[styles.tabText, activeTab === 'UPCOMING' && styles.tabTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'COMPLETED' && styles.tabActive]}
          onPress={() => setActiveTab('COMPLETED')}
        >
          <Text style={[styles.tabText, activeTab === 'COMPLETED' && styles.tabTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {displaySlots.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} meetings.</Text>
          </View>
        ) : (
          displaySlots.map(slot => (
            <View key={slot.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.teacherName}>{slot.teacher.name}</Text>
                  <Text style={styles.studentName}>Regarding {slot.student.firstName}</Text>
                </View>
                {activeTab === 'COMPLETED' && <SparkleSvg />}
              </View>

              <View style={styles.timeBlock}>
                <CalendarSvg />
                <Text style={styles.timeText}>
                  {new Date(slot.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' • '}
                  {new Date(slot.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              {activeTab === 'COMPLETED' && slot.summary ? (
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryTitle}>Teacher's Post-Meeting Note</Text>
                  <Text style={styles.summaryText}>"{slot.summary}"</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAddToCalendar(slot)}>
                  <Text style={styles.actionBtnText}>Add to Calendar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#D4EDE8',
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D4EDE8',
    backgroundColor: '#FFF',
  },
  backTxt: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#6B8C82',
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#1C2B27',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#D4EDE8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#3ECFB2',
    borderColor: '#3ECFB2',
  },
  tabText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#6B8C82',
  },
  tabTextActive: {
    color: '#FFF',
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: '#A3C4BC',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D4EDE8',
    // Retro offset shadow
    shadowColor: '#1C2B27',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  teacherName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#1C2B27',
  },
  studentName: {
    fontFamily: 'Caveat_600SemiBold',
    fontSize: 20,
    color: '#FF6B6B',
    marginTop: -4,
  },
  doodleSVG: {
    transform: [{ rotate: '15deg' }],
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FBF9',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#4A5568',
  },
  summaryBox: {
    marginTop: 20,
    backgroundColor: '#EDFBF8',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3ECFB2',
  },
  summaryTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#3ECFB2',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryText: {
    fontFamily: 'Caveat_600SemiBold',
    fontSize: 20,
    color: '#1C2B27',
    lineHeight: 24,
  },
  actionBtn: {
    marginTop: 20,
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#D4EDE8',
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#6B8C82',
  },
});
