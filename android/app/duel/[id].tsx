import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { KlassoScreen, KlassoCard, Colors, Fonts, DoodleStar, DoodlePencil } from '@/src/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Use same env variable strategy as api data
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001';

export default function DuelScreen() {
  const { id } = useLocalSearchParams();
  const duelId = typeof id === 'string' ? id : id[0];
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<"CONNECTING" | "LOBBY" | "QUESTION" | "RESULT" | "ENDED">("CONNECTING");
  
  const [duelTitle, setDuelTitle] = useState("");
  const [question, setQuestion] = useState<any>(null);
  const [qNumber, setQNumber] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [questionResult, setQuestionResult] = useState<any>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('duel:join', { 
        duelId, 
        studentId: user?.id, 
        studentName: user?.name || "Student" 
      });
    });

    newSocket.on('duel:joined', ({ duelTitle: title }) => {
      if (title) setDuelTitle(title);
      setStatus("LOBBY");
    });

    newSocket.on('duel:started', ({ duel }) => {
      setDuelTitle(duel.title);
    });

    newSocket.on('duel:question', ({ question: qData, timeLimit, qNumber: qn }) => {
      setQuestion(qData);
      setQNumber(qn);
      setTimeRemaining(timeLimit);
      setSelectedOpt(null);
      setQuestionResult(null);
      setStatus("QUESTION");
      startTimeRef.current = Date.now();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    newSocket.on('duel:question-result', ({ correctIndex, answerDistribution, leaderboard }) => {
      clearInterval(timerRef.current!);
      setQuestionResult({ correctIndex, leaderboard });
      setStatus("RESULT");
    });

    newSocket.on('duel:ended', () => {
      setStatus("ENDED");
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      newSocket.disconnect();
    };
  }, [duelId]);

  const handleAnswer = (index: number) => {
    if (selectedOpt !== null || status !== "QUESTION") return;
    
    setSelectedOpt(index);
    const timeToAnswer = (Date.now() - startTimeRef.current) / 1000;
    
    socket?.emit('duel:answer', {
      duelId,
      studentId: user?.id,
      questionId: question.id,
      answerIndex: index,
      timeToAnswer
    });
  };

  const renderLobby = () => (
    <View style={styles.centerContainer}>
      <DoodleStar size={100} color={Colors.yellow} />
      <Text style={styles.lobbyTitle}>You're In!</Text>
      <Text style={styles.lobbySubtitle}>Waiting for {user?.name || "the teacher"} to start the duel...</Text>
    </View>
  );

  const renderQuestion = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.qNum}>Question {qNumber}</Text>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{timeRemaining}s</Text>
        </View>
      </View>
      
      <Text style={styles.qText}>{question?.questionText}</Text>
      
      <View style={styles.optionsGrid}>
        {question?.options.map((opt: string, i: number) => {
          const isSelected = selectedOpt === i;
          return (
            <TouchableOpacity 
              key={i} 
              activeOpacity={0.8}
              style={[
                styles.optionBtn,
                isSelected && styles.optionSelected,
                selectedOpt !== null && !isSelected && { opacity: 0.5 }
              ]}
              onPress={() => handleAnswer(i)}
              disabled={selectedOpt !== null}
            >
              <Text style={[styles.optSymbol, isSelected && { color: 'white' }]}>
                {["A","B","C","D"][i]}
              </Text>
              <Text style={[styles.optText, isSelected && { color: 'white' }]}>{opt}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {selectedOpt !== null && (
        <Text style={styles.waitingText}>Waiting for others...</Text>
      )}
    </View>
  );

  const renderResult = () => {
    const isCorrect = selectedOpt === questionResult.correctIndex;
    const myRankData = questionResult.leaderboard.find((l: any) => l.name === user?.name || true); // fallback for simplicity

    return (
      <View style={styles.centerContainer}>
        {isCorrect ? (
          <DoodleStar size={100} color={Colors.mint} />
        ) : (
          <DoodlePencil size={100} color={Colors.coral} />
        )}
        
        <Text style={[styles.resultTitle, { color: isCorrect ? Colors.mint : Colors.coral }]}>
          {isCorrect ? "Correct!" : "Incorrect"}
        </Text>
        
        <Text style={styles.correctAnswerInfo}>
          The right answer was <Text style={{ fontWeight: 'bold' }}>{["A","B","C","D"][questionResult.correctIndex]}</Text>
        </Text>

        <KlassoCard variant="default" style={styles.rankCard}>
          <Text style={styles.rankText}>Current Rank</Text>
          <Text style={styles.rankScore}>#{myRankData?.rank || "?"}</Text>
        </KlassoCard>
        
        <Text style={styles.waitingText}>Waiting for next question...</Text>
      </View>
    );
  };

  const renderEnded = () => (
    <View style={styles.centerContainer}>
      <DoodleStar size={100} color={Colors.yellow} />
      <Text style={styles.resultTitle}>Duel Completed!</Text>
      <Text style={styles.lobbySubtitle}>Check the main board for final results.</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.backBtnText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KlassoScreen>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {status === "CONNECTING" && <View style={styles.centerContainer}><Text>Connecting...</Text></View>}
        {status === "LOBBY" && renderLobby()}
        {status === "QUESTION" && renderQuestion()}
        {status === "RESULT" && renderResult()}
        {status === "ENDED" && renderEnded()}
      </View>
    </KlassoScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lobbyTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 32,
    color: Colors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  lobbySubtitle: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  qNum: {
    fontFamily: Fonts.accent,
    fontSize: 24,
    color: Colors.textMuted,
  },
  timerBox: {
    backgroundColor: Colors.coralLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  timerText: {
    fontFamily: Fonts.headingXB,
    color: Colors.coral,
    fontSize: 20,
  },
  qText: {
    fontFamily: Fonts.headingXB,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 40,
  },
  optionsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E8E4D9',
    borderRadius: 16,
    padding: 20,
  },
  optionSelected: {
    backgroundColor: Colors.mint,
    borderColor: Colors.mint,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  optSymbol: {
    fontFamily: Fonts.headingXB,
    fontSize: 20,
    color: 'rgba(0,0,0,0.3)',
    marginRight: 16,
  },
  optText: {
    fontFamily: Fonts.headingXB,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  waitingText: {
    fontFamily: Fonts.accent,
    fontSize: 20,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  resultTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 40,
    marginTop: 24,
    marginBottom: 8,
  },
  correctAnswerInfo: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 40,
  },
  rankCard: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  rankText: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.textMuted,
  },
  rankScore: {
    fontFamily: Fonts.headingXB,
    fontSize: 48,
    color: Colors.textPrimary,
  },
  backBtn: {
    backgroundColor: Colors.yellow,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    marginTop: 40,
  },
  backBtnText: {
    fontFamily: Fonts.headingXB,
    fontSize: 18,
    color: Colors.textPrimary,
  }
});
