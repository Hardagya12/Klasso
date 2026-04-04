import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { apiData } from '@/lib/api';

const MOODS = ['GREAT', 'GOOD', 'OKAY', 'SAD', 'STRESSED'];

const MoodFace = ({ mood, active }: { mood: string, active: boolean }) => {
  const color = active ? '#FFFFFF' : '#2C2A24';
  const bgColor = active ? '#3ECFB2' : '#F7FBF9';

  let faceLines = null;
  if(mood === 'GREAT') {
    faceLines = (
      <>
        <Path d="M9 10 Q10 8 11 10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M15 10 Q16 8 17 10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M8 14 Q12 18 16 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
  } else if (mood === 'GOOD') {
    faceLines = (
      <>
        <Circle cx="10" cy="10" r="1" fill={color}/>
        <Circle cx="16" cy="10" r="1" fill={color}/>
        <Path d="M9 15 Q12 17 15 15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
  } else if (mood === 'OKAY') {
    faceLines = (
       <>
        <Circle cx="10" cy="10" r="1" fill={color}/>
        <Circle cx="16" cy="10" r="1" fill={color}/>
        <Path d="M9 15 L15 15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
  } else if (mood === 'SAD') {
    faceLines = (
       <>
        <Path d="M9 10 L11 10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M15 10 L17 10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M9 16 Q12 14 15 16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
  } else if (mood === 'STRESSED') {
    faceLines = (
      <>
        <Path d="M8 9 L11 11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M18 9 L15 11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Circle cx="10" cy="12" r="1" fill={color}/>
        <Circle cx="16" cy="12" r="1" fill={color}/>
        <Path d="M10 16 Q11 15 12 16 T14 16 T16 16" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      </>
    );
  }

  return (
    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: bgColor, borderCurve: 'continuous', borderWidth: 2, borderColor: active ? '#1C5C4F' : '#E8E4D9', alignItems: 'center', justifyContent: 'center', shadowColor: '#1C2B27', shadowOffset: { width: 3, height: 3 }, shadowOpacity: active ? 1 : 0, shadowRadius: 0, elevation: active ? 3 : 0 }}>
       <Svg width="26" height="26" viewBox="0 0 26 26" fill="none">
         <Circle cx="13" cy="13" r="12" stroke={color} strokeWidth="2"/>
         {faceLines}
       </Svg>
    </View>
  );
};

export default function MoodScreen() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data: any = await apiData('/api/mood/my-summary');
      setSummary(data);
      // Determine if checked in today
      if (data?.checkIns?.length > 0) {
        const last = data.checkIns[data.checkIns.length - 1];
        const lastDate = new Date(last.date);
        const today = new Date();
        if (lastDate.toDateString() === today.toDateString()) {
          setSelectedMood(last.mood);
          setNote(last.note || '');
        }
      }
    } catch(e) {
      console.warn(e);
      Alert.alert("Error", "Could not load mood history.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedMood) return;
    setCheckingIn(true);
    try {
      await apiData('/api/mood/checkin', {
        method: 'POST',
        body: JSON.stringify({ mood: selectedMood, note })
      });
      fetchSummary();
      Alert.alert("Recorded!", "Thank you for checking in.");
      router.back();
    } catch (e) {
      Alert.alert("Check-in Failed", "Could not save your mood.");
    } finally {
      setCheckingIn(false);
    }
  };

  const getMoodColor = (mood: string) => {
    switch(mood){
      case 'GREAT': return '#5BAD6F';
      case 'GOOD': return '#5BAD6F';
      case 'OKAY': return '#F5A623';
      case 'SAD': return '#E8534A';
      case 'STRESSED': return '#E8534A';
      default: return '#E8E4D9';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7FBF9', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7FBF9' }}>
      <Stack.Screen options={{ 
        title: "My Wellbeing", 
        headerStyle: { backgroundColor: '#F7FBF9' },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: 'Nunito-Bold', color: '#2C2A24' }
      }} />

      <ScrollView style={{ flex: 1, padding: 20 }}>
        
        <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 16, borderWidth: 2, borderColor: '#E8E4D9', shadowColor: '#1C2B27', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4, marginBottom: 24 }}>
           <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 18, color: '#2C2A24', marginBottom: 8 }}>How are you feeling today?</Text>
           <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 14, color: '#7A7670', marginBottom: 20 }}>Only you can see this. It helps us support you better.</Text>

           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
             {MOODS.map(m => (
               <TouchableOpacity key={m} activeOpacity={0.7} onPress={() => setSelectedMood(m)}>
                 <MoodFace mood={m} active={selectedMood === m} />
               </TouchableOpacity>
             ))}
           </View>

           <TextInput 
             style={{ backgroundColor: '#F7FBF9', borderRadius: 12, borderWidth: 2, borderColor: '#E8E4D9', padding: 14, fontFamily: 'DMSans-Regular', fontSize: 15, color: '#2C2A24', minHeight: 80, textAlignVertical: 'top' }}
             placeholder="Add an optional note about today..."
             placeholderTextColor="#A1A1AA"
             multiline
             value={note}
             onChangeText={setNote}
           />

           <TouchableOpacity 
             disabled={!selectedMood || checkingIn}
             onPress={handleCheckIn}
             style={{ backgroundColor: selectedMood ? '#FF6B6B' : '#E8E4D9', paddingVertical: 16, borderRadius: 100, alignItems: 'center', marginTop: 24, borderWidth: 2, borderColor: '#2C2A24', shadowColor: '#1C2B27', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 }}
           >
             {checkingIn ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 16, color: selectedMood ? '#FFF' : '#A1A1AA' }}>Save Check-in</Text>}
           </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 40 }}>
           <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 20, color: '#2C2A24', marginBottom: 16 }}>This Week</Text>
           
           {summary?.checkIns?.length === 0 ? (
             <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 15, color: '#7A7670' }}>No check-ins yet this week.</Text>
           ) : (
             <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
               {summary?.checkIns?.map((c: any, i: number) => {
                 const d = new Date(c.date);
                 return (
                   <View key={i} style={{ width: '30%', backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 2, borderColor: '#E8E4D9', shadowColor: '#1C2B27', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 }}>
                     <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 12, color: '#7A7670', marginBottom: 8 }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                     <Svg width="20" height="20" viewBox="0 0 26 26" fill="none">
                       <Circle cx="13" cy="13" r="12" fill={getMoodColor(c.mood)} stroke="#2C2A24" strokeWidth="2"/>
                     </Svg>
                   </View>
                 );
               })}
             </View>
           )}
        </View>

      </ScrollView>
    </View>
  );
}
