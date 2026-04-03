import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, LayoutAnimation } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  KlassoScreen, KlassoCard, KlassoBadge, KlassoButton,
  DoodleStar, DoodleSparkle, DoodleRocket, DoodleStarburst, DoodleArrow,
  DoodleBook, DoodleLightbulb, DoodleRuler, DoodleFlower, DoodleLeaf, DoodleCloud, DoodlePencil,
  Colors, Fonts,
} from '@/src/components';
import { apiData } from '@/lib/api';

type ChatMsg = { id: number; text: string; sender: 'user' | 'ai' };

// Helper for typing indicator
function TypingIndicator() {
  const [pulse, setPulse] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setPulse(p => (p + 1) % 3), 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.bubbleAI}>
      <View style={styles.aiAvatar}>
        <DoodleLightbulb size={18} color="white" />
      </View>
      <View style={[styles.bubbleContentAI, { flexDirection: 'row', gap: 6, alignItems: 'center', height: 30, paddingHorizontal: 16 }]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{ 
            width: 8, height: 8, borderRadius: 4, 
            backgroundColor: pulse === i ? Colors.mint : Colors.mintLight 
          }} />
        ))}
      </View>
    </View>
  );
}

// Doodle Paper Plane icon
const DoodlePaperPlane = ({ size = 24, color = "white" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 12l20-9-9 20-3-8-8-3z" fill={color} />
    <Path d="M12 15l-3 6m0-6V8" stroke="#1C2B27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedQuestions = [
    { text: "Explain photosynthesis 🌿", rotate: '-2deg' },
    { text: "Help me solve quadratic equations", rotate: '3deg' },
    { text: "Summarize Chapter 4", rotate: '-1deg' },
    { text: "What's the difference between...", rotate: '2deg' },
  ];

  const subjects = [
    { name: "Math", color: Colors.mint, icon: DoodleRuler },
    { name: "Science", color: Colors.purple, icon: DoodleLightbulb },
    { name: "English", color: Colors.coral, icon: DoodleBook },
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMsg = { id: Date.now(), text: text.trim(), sender: 'user' };
    const thread = [...messages, newMsg];
    setMessages(thread);
    setInputText('');
    setIsTyping(true);
    try {
      const payload = thread
        .filter((m) => m.sender === 'user' || m.sender === 'ai')
        .map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
      const { reply } = await apiData<{ reply: string }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: payload }),
      });
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: reply, sender: 'ai' }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not reach tutor';
      setMessages((prev) => [...prev, { id: Date.now() + 2, text: msg, sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: Colors.bg }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ─── HEADER (CORAL) ───────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <View style={styles.bulbWrapper}>
            <DoodleLightbulb size={50} color={Colors.yellow} />
            {/* 6 Radiating Sparkles */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <View key={i} style={[styles.radiantSparkle, { transform: [{ rotate: `${deg}deg` }, { translateY: -35 }] }]}>
                <DoodleSparkle size={16} color="white" />
              </View>
            ))}
          </View>
          <Text style={styles.headerTitle}>AI Study Buddy</Text>
          <Text style={styles.headerSubtitle}>powered by Claude</Text>
        </View>

        {/* Header Decor */}
        <View style={{ position: 'absolute', top: 20, left: 10, opacity: 0.2 }}><DoodleStarburst size={50} color="white" /></View>
        <View style={{ position: 'absolute', bottom: 30, right: 10, opacity: 0.2 }}><DoodleStarburst size={50} color="white" /></View>
        <View style={{ position: 'absolute', top: 60, right: 30 }}><DoodleCloud size={40} color="white" /></View>
      </View>

      {/* ─── CHAT AREA ───────────────────────────────── */}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.freshState}>
            <View style={styles.suggestionsContainer}>
              <View style={styles.bgBulb}><DoodleLightbulb size={120} color={Colors.mint} /></View>
              {suggestedQuestions.map((q, i) => (
                <TouchableOpacity key={i} activeOpacity={0.8} onPress={() => handleSend(q.text)}>
                  <KlassoCard variant="default" style={StyleSheet.flatten([styles.suggestionCard, { transform: [{ rotate: q.rotate }], shadowColor: "#D4EDE8", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 }])}>
                    <Text style={styles.suggestText}>{q.text}</Text>
                  </KlassoCard>
                </TouchableOpacity>
              ))}
              <View style={styles.arrowDecor}><DoodleArrow size={30} color={Colors.coral} /></View>
            </View>

            <View style={styles.starterGrid}>
              <Text style={styles.starterHeader}>Pick a subject to start</Text>
              <View style={styles.gridRow}>
                {subjects.slice(0, 2).map((s, i) => (
                  <TouchableOpacity key={i} style={[styles.gridCell, { backgroundColor: s.color }]} onPress={() => handleSend(`Help me with ${s.name}`)}>
                    <s.icon size={32} color="white" />
                    <Text style={styles.cellText}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.messageList}>
            {messages.map((msg) => (
              <View key={msg.id} style={msg.sender === 'ai' ? styles.bubbleContainerLeft : styles.bubbleContainerRight}>
                {msg.sender === 'ai' && (
                  <View style={styles.aiAvatar}>
                    <DoodleLightbulb size={18} color="white" />
                  </View>
                )}
                <View style={msg.sender === 'ai' ? styles.bubbleContentAI : styles.bubbleContentUser}>
                  <Text style={msg.sender === 'ai' ? styles.msgTextAI : styles.msgTextUser}>{msg.text}</Text>
                  {msg.sender === 'ai' && (
                    <View style={styles.aiSignature}><DoodleSparkle size={12} color={Colors.mint} /></View>
                  )}
                </View>
              </View>
            ))}
            {isTyping && <TypingIndicator />}
          </View>
        )}
      </ScrollView>

      {/* ─── INPUT AREA ───────────────────────────────── */}
      <View style={styles.inputWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {subjects.map((sub, i) => (
            <TouchableOpacity key={i} style={[styles.chip, { borderColor: sub.color }]} onPress={() => setInputText(`Help me with ${sub.name}`)}>
              <sub.icon size={14} color={sub.color} />
              <Text style={styles.chipText}>{sub.name}</Text>
            </TouchableOpacity>
          ))}
          <DoodleArrow size={16} color={Colors.coral} />
        </ScrollView>

        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity style={styles.iconBtn}>
            <View style={{ transform: [{ rotate: '90deg' }] }}><DoodleLeaf size={24} color={Colors.mint} /></View>
          </TouchableOpacity>
          <TextInput 
            style={styles.textInput} 
            placeholder="Ask your Buddy..." 
            placeholderTextColor={Colors.textLight}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(inputText)}>
            <DoodlePaperPlane size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.coral,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingBottom: 20,
    shadowColor: Colors.coralDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bulbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    width: 80,
    marginBottom: 8,
  },
  radiantSparkle: {
    position: 'absolute',
  },
  headerTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 26,
    color: 'white',
  },
  headerSubtitle: {
    fontFamily: Fonts.accent,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  chatArea: {
    padding: 24,
    paddingTop: 40,
    flexGrow: 1,
  },
  freshState: {
    flex: 1,
    paddingTop: 10,
  },
  suggestionsContainer: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 60,
    position: 'relative',
  },
  bgBulb: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -60,
    opacity: 0.06,
  },
  suggestionCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D4EDE8',
  },
  suggestText: {
    fontFamily: Fonts.accent,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  arrowDecor: {
    position: 'absolute',
    bottom: -40,
    right: 40,
    transform: [{ rotate: '-45deg' }],
  },
  starterGrid: {
    marginTop: 'auto',
  },
  starterHeader: {
    fontFamily: Fonts.headingXB,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  gridCell: {
    flex: 1,
    maxWidth: 160,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cellText: {
    fontFamily: Fonts.headingXB,
    fontSize: 16,
    color: 'white',
    marginTop: 8,
  },
  messageList: {
    gap: 16,
    paddingBottom: 20,
  },
  bubbleContainerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 8,
  },
  bubbleContainerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4EDE8',
  },
  bubbleContentAI: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D4EDE8',
    maxWidth: '80%',
    shadowColor: '#D4EDE8',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  msgTextAI: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  aiSignature: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleContentUser: {
    backgroundColor: Colors.mint,
    padding: 16,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
    shadowColor: '#1A9E87',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  msgTextUser: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: 'white',
    lineHeight: 22,
  },
  bubbleAI: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#D4EDE8',
    paddingTop: 12,
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 12,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
  },
  chipText: {
    fontFamily: Fonts.headingXB,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontFamily: Fonts.bodyMed,
    fontSize: 16,
    color: Colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: '#D4EDE8',
    height: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowMint,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
});
