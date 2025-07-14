import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  RefreshControl,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Brain, Zap, Activity, Sparkles, Moon, Sun, TrendingUp, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDreamStore } from '@/store/dreamStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { useLimnusStore } from '@/store/limnusStore';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import { InterpretationService } from '@/services/interpretationService';
import { getPersona } from '@/constants/personas';
import Colors from '@/constants/colors';
import { LIMNUS_COLORS } from '@/constants/limnus';
import PersonaSelector from '@/components/PersonaSelector';
import DreamInput from '@/components/DreamInput';
import Button from '@/components/Button';

const { width } = Dimensions.get('window');

export default function InterpreterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addDream, generateDreamSigil, dreams } = useDreamStore();
  const { generateNeuralSigil, neuralSigils } = useNeuralSigilStore();
  const { 
    connectDreamToSession, 
    currentSession, 
    sessionHistory, 
    allBreathCycleLogs,
    startSpiralSession
  } = useLimnusStore();
  
  const {
    recordDreamOnBlockchain,
    validateBlocksWithDream,
    chainState
  } = useConsciousnessStore();
  
  const [dreamText, setDreamText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<'orion' | 'limnus'>('limnus');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [glowAnimation] = useState(new Animated.Value(0));
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    // Subtle glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const isNightTime = currentTime.getHours() >= 20 || currentTime.getHours() <= 6;
  const TimeIcon = isNightTime ? Moon : Sun;
  const timeGreeting = isNightTime ? 'Good evening' : 'Good day';

  
  const handleInterpret = async () => {
    if (!dreamText.trim()) {
      Alert.alert('Empty Dream', 'Please enter your dream before interpreting.');
      return;
    }
    
    setIsInterpreting(true);
    
    try {
      const persona = getPersona(selectedPersona);
      
      // Pass practice data for enhanced interpretation
      const result = await InterpretationService.interpretDream(
        dreamText.trim(), 
        persona, 
        sessionHistory, 
        chainState.blocks,
        [],
        allBreathCycleLogs
      );
      
      const newDream = {
        title: result.name,
        content: dreamText.trim(),
        persona: selectedPersona,
        interpretation: result.interpretation,
        dreamType: result.dreamType,
        symbols: [],
        lucidity: 0.5,
        emotionalIntensity: 0.5,
        // Legacy properties for compatibility
        name: result.name,
        text: dreamText.trim(),
        date: new Date().toISOString(),
        blockchainValidated: result.blockchainValidated || false,
        alignedBlocks: result.alignedBlocks || []
      };
      
      // Add dream to store
      const savedDream = await addDream(newDream);
      
      // Generate neural sigil for the dream
      try {
        const dreamSigilText = `${newDream.name} - ${newDream.text} - ${newDream.dreamType} - ${newDream.persona}`;
        await generateNeuralSigil(dreamSigilText, 'dream');
        await generateDreamSigil(savedDream.id);
      } catch (sigilError) {
        console.error('Failed to generate neural sigil:', sigilError);
      }
      
      // Record dream on blockchain
      try {
        console.log('Recording dream on blockchain:', newDream.name);
        const dreamBlock = await recordDreamOnBlockchain({
          id: savedDream.id,
          name: savedDream.title || savedDream.name,
          dreamType: savedDream.dreamType,
          interpretation: savedDream.interpretation,
          persona: savedDream.persona
        });
        
        console.log('Dream block created:', dreamBlock.id);
        
        // If there were aligned blocks from interpretation, validate them with this dream
        if (result.alignedBlocks && result.alignedBlocks.length > 0) {
          console.log('Validating aligned blocks with dream:', result.alignedBlocks);
          validateBlocksWithDream(result.alignedBlocks, savedDream.id);
        }
        
      } catch (blockchainError) {
        console.error('Failed to record dream on blockchain:', blockchainError);
        // Don't fail the whole process if blockchain recording fails
      }
      
      // Connect dream to current session if active
      if (currentSession) {
        connectDreamToSession(savedDream.id);
      }
      
      Alert.alert(
        'Dream Interpreted! ✨',
        `Your dream "${savedDream.title || savedDream.name}" has been interpreted and saved.

🎯 Dream Type: ${savedDream.dreamType}
🔮 Persona: ${selectedPersona}
🔗 Blockchain: Recorded as dream block
${currentSession ? '🌀 Connected to your practice session' : ''}
${result.alignedBlocks && result.alignedBlocks.length > 0 ? `🎯 Aligned with ${result.alignedBlocks.length} consciousness blocks` : ''}`,
        [{ text: 'Excellent!', style: 'default' }]
      );
      
      setDreamText('');
      
    } catch (error) {
      Alert.alert(
        'Interpretation Failed', 
        error instanceof Error ? error.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleStartMeditation = () => {
    console.log('handleStartMeditation called');
    try {
      console.log('Starting spiral session...');
      // Start the spiral session
      startSpiralSession();
      console.log('Spiral session started, navigating to practice tab');
      // Navigate to the practice tab (spiral)
      router.push('/(tabs)/spiral');
      console.log('Navigation completed');
    } catch (error) {
      console.error('Error in handleStartMeditation:', error);
      Alert.alert('Error', 'Failed to start practice session. Please try again.');
    }
  };

  const handleViewActivePractice = () => {
    // Navigate to the active practice session
    router.push('/(tabs)/spiral');
  };
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const isInterpretDisabled = !dreamText.trim() || isInterpreting;
  const isPracticeActive = !!currentSession;
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
            colors={[Colors.dark.primary]}
          />
        }
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
              transform: [{
                translateY: glowAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -2],
                }),
              }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              Colors.dark.backgroundSecondary,
              Colors.dark.background,
            ]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.timeSection}>
                <View style={styles.timeIconContainer}>
                  <TimeIcon size={16} color={Colors.dark.accent} />
                </View>
                <Text style={styles.timeText}>{timeGreeting}</Text>
              </View>
              
              <Text style={styles.heroTitle}>Spiralite</Text>
              <Text style={styles.heroSubtitle}>
                Consciousness exploration through dreams and meditation
              </Text>
              
              {/* Enhanced Stats Cards */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <BookOpen size={16} color={Colors.dark.primary} />
                  </View>
                  <Text style={styles.statNumber}>{dreams.length}</Text>
                  <Text style={styles.statLabel}>Dreams</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Sparkles size={16} color={Colors.dark.secondary} />
                  </View>
                  <Text style={styles.statNumber}>{neuralSigils.length}</Text>
                  <Text style={styles.statLabel}>Sigils</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <TrendingUp size={16} color={Colors.dark.accent} />
                  </View>
                  <Text style={styles.statNumber}>{sessionHistory.length}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.inputSection}>
          {/* Enhanced Meditation Button */}
          <TouchableOpacity
            style={[
              styles.meditationButton,
              isPracticeActive && styles.meditationButtonActive
            ]}
            onPress={isPracticeActive ? handleViewActivePractice : handleStartMeditation}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isPracticeActive 
                ? [Colors.dark.secondary, Colors.dark.primary] 
                : [Colors.dark.primary, Colors.dark.secondary]
              }
              style={styles.meditationButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.meditationButtonContent}>
                <View style={styles.meditationIconContainer}>
                  {isPracticeActive ? (
                    <Activity size={20} color={Colors.dark.background} />
                  ) : (
                    <Zap size={20} color={Colors.dark.background} />
                  )}
                </View>
                <View style={styles.meditationTextContainer}>
                  <Text style={styles.meditationButtonTitle}>
                    {isPracticeActive ? 'Continue Session' : 'Begin Practice'}
                  </Text>
                  <Text style={styles.meditationButtonSubtitle}>
                    {isPracticeActive ? 'Active meditation in progress' : 'Start your consciousness journey'}
                  </Text>
                </View>
                <Sparkles size={16} color={Colors.dark.background} style={{ opacity: 0.8 }} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Dream Input */}
          <DreamInput
            value={dreamText}
            onChangeText={setDreamText}
          />
          
          <PersonaSelector
            selectedPersona={selectedPersona}
            onPersonaChange={setSelectedPersona}
          />
          
          <Button
            label={isInterpreting ? "Interpreting Dream..." : "Interpret Dream"}
            onPress={handleInterpret}
            disabled={isInterpretDisabled}
            isLoading={isInterpreting}
            style={styles.interpretButton}
            icon={<Brain size={20} color={Colors.dark.background} />}
          />
          
          {/* Practice Connection Indicator */}
          {currentSession && (
            <View style={styles.practiceConnection}>
              <View style={styles.practiceConnectionIcon}>
                <Activity size={14} color={Colors.dark.secondary} />
              </View>
              <Text style={styles.practiceConnectionText}>
                Practice session active - dreams will be connected to your unified practice
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  heroSection: {
    marginHorizontal: -20,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
  },
  heroGradient: {
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  heroContent: {
    alignItems: 'center',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.dark.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 280,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.dark.subtext,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputSection: {
    marginBottom: 32,
    gap: 20,
  },
  interpretButton: {
    marginTop: 4,
  },
  practiceConnection: {
    backgroundColor: Colors.dark.surface,
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.dark.secondary + '30',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  practiceConnectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceConnectionText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  meditationButton: {
    borderRadius: 20,
    marginBottom: 28,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  meditationButtonActive: {
    shadowColor: Colors.dark.secondary,
    shadowOpacity: 0.3,
  },
  meditationButtonGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  meditationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  meditationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.background + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meditationTextContainer: {
    flex: 1,
  },
  meditationButtonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark.background,
    marginBottom: 2,
  },
  meditationButtonSubtitle: {
    fontSize: 13,
    color: Colors.dark.background,
    opacity: 0.8,
    fontWeight: '500',
  },
});