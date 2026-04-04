import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  KlassoScreen, KlassoCard, KlassoBadge, KlassoButton,
  DoodleStar, DoodleSparkle, DoodleRocket, DoodleStarburst, DoodleArrow,
  DoodleBook, DoodleLightbulb, DoodleRuler, DoodleFlower, DoodleLeaf, DoodleCheckCircle, DoodlePencil,
  Colors, Fonts,
} from '@/src/components';
import { apiData } from '@/lib/api';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Hand-drawn animated checkbox
function HandDrawnCheckbox({ checked, onPress }: { checked: boolean, onPress: () => void }) {
  const [anim] = useState(new Animated.Value(checked ? 1 : 0));

  const toggle = () => {
    onPress();
    Animated.timing(anim, {
      toValue: checked ? 0 : 1,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  };

  const pathLength = 50; // Approximated path length for checkmark
  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [pathLength, 0],
  });

  return (
    <TouchableOpacity onPress={toggle} style={styles.checkWrapper} activeOpacity={0.8}>
      <Svg width="40" height="40" viewBox="0 0 40 40">
        {/* Irregular hand-drawn border circle */}
        <Path 
          d="M20,2 C10,2 2,10 2,20 C2,30 10,38 20,38 C30,38 38,30 38,20 C38,10 30,2 20,2 Z" 
          fill={checked ? Colors.mint : "none"} 
          stroke={checked ? Colors.mint : Colors.border} 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        {/* Animated checkmark inside */}
        <AnimatedPath 
          d="M12 20 l 5 5 l 10 -12" 
          fill="none" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
    </TouchableOpacity>
  );
}

// Doodle Paper / Attachment
const DoodlePaper = ({ size = 16, color = Colors.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <Path d="M13 2v7h7" />
  </Svg>
);

function AssignmentCard({ item, onToggle }: { item: any, onToggle: () => void }) {
  const isOverdue = item.status === 'overdue';
  const isDone = item.status === 'done';

  return (
    <KlassoCard variant="default" style={StyleSheet.flatten([
      styles.taskCard, 
      isOverdue && { borderLeftWidth: 4, borderLeftColor: Colors.coral },
      isDone && { opacity: 0.5 }
    ])}>
      {/* Top color strip */}
      <View style={[styles.topStrip, { backgroundColor: item.color }]} />

      <View style={styles.cardInternal}>
        <View style={styles.cardLeft}>
          <View style={styles.titleRow}>
            <KlassoBadge label={item.subject} color={
              item.subject === 'Science' ? 'purple' : 
              item.subject === 'Math' ? 'mint' : 'coral'
            } />
            {isOverdue && <KlassoBadge label="OVERDUE" color="coral" />}
          </View>
          
          <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.taskDesc} numberOfLines={1}>{item.desc}</Text>
          
          <View style={styles.cardPropsRow}>
            <View style={styles.propItem}>
              <DoodleRuler size={14} color={isOverdue ? Colors.coral : Colors.textMuted} />
              <Text style={[styles.propText, isOverdue && { color: Colors.coral }]}>Due: {item.due}</Text>
            </View>
            {item.pages && (
              <View style={styles.propItem}>
                <DoodleBook size={14} color={Colors.textMuted} />
                <Text style={styles.propText}>{item.pages}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.bottomRow}>
            <Text style={styles.teacherName}>{item.teacher_name || 'Teacher'}</Text>
            <View style={styles.dot} />
            <DoodlePaper size={14} />
            <View style={styles.dot} />
            <View style={[styles.priorityDot, { backgroundColor: item.priority === 'high' ? Colors.coral : Colors.yellow }]} />
          </View>
        </View>

        <View style={styles.cardRight}>
          <HandDrawnCheckbox checked={isDone} onPress={onToggle} />
          {isDone && <Text style={styles.doneLabel}>Completed</Text>}
          {isOverdue && !isDone && (
            <View style={{ position: 'absolute', top: -10, right: -10 }}>
              <DoodleSparkle size={16} color={Colors.coral} />
            </View>
          )}
        </View>
      </View>
    </KlassoCard>
  );
}

export default function HomeworkScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('Pending');

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Fetch all assignments for this student
    apiData<{ data: any[] }>('/api/assignments')
      .then((res: any) => {
        // Assume API returns res.data instead of array directly ? Wait, apiData already unpacks `data` if it is an Envelope. 
        // Our apiData returns T which is the actual data array if it's paginated it might return { pageSize, data } or similar.
        // Let's check what `sendPaginated` returns. It returns { success: true, data: data, pagination }
        // So `apiData('/api/assignments')` will return the actual list if it's standard Envelope, or an object with data if paginated.
        // Actually, sendPaginated puts rows in `data`. apiData extracts `json.data`.
        // So `res` is just the array. Wait, sendPaginated: `res.json({ success: true, data, pagination })`
        // So apiData returns `data` which is the array.
        const items = Array.isArray(res) ? res : res.data ?? [];
        
        const mapped = items.map((item: any) => {
          const due = new Date(item.due_date);
          const isOverdue = due < new Date() && item.submission_count === 0;
          return {
            id: item.id,
            subject: item.subject_name || 'Subject',
            title: item.title,
            desc: item.description,
            due: due.toLocaleDateString(),
            priority: 'medium',
            color: Colors.mint,
            status: item.submission_count > 0 ? 'done' : (isOverdue ? 'overdue' : 'pending'),
            teacher_name: item.teacher_name || 'Teacher'
          };
        });
        setTasks(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    // Optimistic update
    const isNowDone = task.status !== 'done';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: isNowDone ? 'done' : 'pending' } : t));

    if (isNowDone) {
      apiData(`/api/assignments/${id}/submit`, { method: 'POST' }).catch(err => {
        console.error('Submit failed', err);
        // Revert on fail
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'pending' } : t));
      });
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return t.status === 'pending';
    if (filter === 'Done') return t.status === 'done';
    if (filter === 'Overdue') return t.status === 'overdue';
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'overdue').length;

  return (
    <KlassoScreen noSafeArea>
      {/* ─── HEADER ───────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTopUser}>
          <View style={styles.titleWrapper}>
            <DoodleBook size={28} color={Colors.coral} />
            <Text style={styles.headerTitle}>Homework</Text>
          </View>
          <View style={{ transform: [{ rotate: '90deg' }] }}>
            <DoodleArrow size={24} color={Colors.textPrimary} />
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
          {['All', 'Pending', 'Done', 'Overdue'].map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* ─── PENDING COUNT CARD ───────────────── */}
        {pendingCount > 0 && filter !== 'Done' && (
          <KlassoCard variant="default" style={StyleSheet.flatten([styles.pendingHero, { shadowColor: "#E84545", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }])}>
            {/* Background Pencils overlapping */}
            <View style={{ position: 'absolute', right: -20, top: 10, opacity: 0.3, transform: [{ rotate: '45deg' }] }}>
              <DoodlePencil size={80} color={Colors.coral} />
            </View>
            <View style={{ position: 'absolute', right: 40, top: -20, opacity: 0.15, transform: [{ rotate: '-15deg' }] }}>
              <DoodlePencil size={100} color={Colors.coral} />
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Text style={styles.pendingNumber}>{pendingCount}</Text>
              <Text style={styles.pendingText}>assignments due{'\n'}this week</Text>
            </View>
          </KlassoCard>
        )}

        {/* ─── TASK LIST ───────────────────────── */}
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <DoodleCheckCircle size={100} color={Colors.mint} />
            
            <View style={{ position: 'absolute', top: '30%', left: '30%' }}><DoodleSparkle size={20} color={Colors.yellow} /></View>
            <View style={{ position: 'absolute', top: '20%', right: '20%' }}><DoodleSparkle size={15} color={Colors.coral} /></View>
            <View style={{ position: 'absolute', bottom: '40%', right: '30%' }}><DoodleSparkle size={25} color={Colors.mint} /></View>
            <View style={{ position: 'absolute', bottom: '10%', right: '40%' }}><DoodleRocket size={40} color={Colors.purple} /></View>

            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>You're on top of everything ✦</Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {filteredTasks.map(t => (
              <AssignmentCard key={t.id} item={t} onToggle={() => toggleTask(t.id)} />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KlassoScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F7FBF9',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  headerTopUser: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  filterTabs: {
    gap: 10,
    paddingBottom: 4,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: 'white',
  },
  filterTabActive: {
    backgroundColor: Colors.mint,
    borderColor: Colors.mint,
  },
  filterTabText: {
    fontFamily: Fonts.headingXB,
    fontSize: 14,
    color: Colors.textMuted,
  },
  filterTabTextActive: {
    color: 'white',
  },
  content: {
    padding: 24,
  },
  pendingHero: {
    backgroundColor: '#FFF0F0',
    borderColor: Colors.coral,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  pendingNumber: {
    fontFamily: Fonts.headingXB,
    fontSize: 48,
    color: Colors.coral,
    lineHeight: 52,
  },
  pendingText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 16,
    color: Colors.textMuted,
  },
  taskList: {
    gap: 16,
  },
  taskCard: {
    padding: 0, // removed padding to allow top strip
    overflow: 'hidden',
  },
  topStrip: {
    height: 8,
    width: '100%',
  },
  cardInternal: {
    padding: 16,
    flexDirection: 'row',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  taskTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  taskDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  cardPropsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  propItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  propText: {
    fontFamily: Fonts.accent,
    fontSize: 15,
    color: Colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teacherName: {
    fontFamily: Fonts.bodyMed,
    fontSize: 11,
    color: Colors.textMuted,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardRight: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrapper: {
    padding: 10,
  },
  doneLabel: {
    fontFamily: Fonts.accent,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  emptyStateContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 22,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Fonts.accent,
    fontSize: 16,
    color: Colors.textMuted,
  },
});
