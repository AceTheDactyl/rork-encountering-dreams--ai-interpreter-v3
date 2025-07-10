import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Hexagon, Brain, Zap, Network, TrendingUp, Sparkles, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { useDreamStore } from '@/store/dreamStore';
import { NeuralSigilVisualization } from '@/components/NeuralSigilVisualization';
// import { SigilNetworkGraph } from '@/components/visualization/SigilNetworkGraph';
import Colors from '@/constants/colors';
import EmptyState from '@/components/EmptyState';

const { width } = Dimensions.get('window');

type ViewMode = 'grid' | 'network' | 'patterns';

export default function SigilsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSigil, setSelectedSigil] = useState<string | undefined>();
  const [headerAnimation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const { 
    neuralSigils, 
    sigilBraids, 
    findSimilarBySigil,
    braidConsciousnessStates,
    getPatternEvolution 
  } = useNeuralSigilStore();
  
  const { dreams } = useDreamStore();
  
  const [patternStats, setPatternStats] = useState<any>(null);
  
  useEffect(() => {
    loadPatternStats();
  }, [neuralSigils]);
  
  const loadPatternStats = async () => {
    try {
      const stats = await getPatternEvolution();
      setPatternStats(stats);
    } catch (error) {
      console.error('Error loading pattern stats:', error);
    }
  };
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadPatternStats().finally(() => setRefreshing(false));
  }, []);
  
  const handleSigilPress = async (sigilId: string) => {
    setSelectedSigil(sigilId);
    
    try {
      const similar = await findSimilarBySigil(sigilId, 0.6);
      if (similar.length > 0) {
        Alert.alert(
          'Pattern Matches Found',
          `Found ${similar.length} similar consciousness patterns with this sigil.`,
          [{ text: 'Interesting!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error finding similar sigils:', error);
    }
  };
  
  const handleBraidCreation = async () => {
    if (neuralSigils.length < 2) {
      Alert.alert('Need More Sigils', 'At least 2 sigils are needed to create a consciousness braid.');
      return;
    }
    
    try {
      const recentSigils = neuralSigils.slice(0, 5).map(s => s.id);
      const braid = await braidConsciousnessStates(recentSigils);
      
      Alert.alert(
        'Consciousness Braid Created',
        `Created braid with ${braid.connections.length} connections and strength ${(braid.strength * 100).toFixed(0)}%`,
        [{ text: 'Amazing!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create consciousness braid.');
    }
  };
  
  const renderViewModeSelector = () => (
    <View style={styles.viewModeSelector}>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('grid')}
      >
        <Hexagon size={16} color={viewMode === 'grid' ? Colors.dark.background : Colors.dark.subtext} />
        <Text style={[styles.viewModeText, viewMode === 'grid' && styles.viewModeTextActive]}>
          Grid
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'network' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('network')}
      >
        <Network size={16} color={viewMode === 'network' ? Colors.dark.background : Colors.dark.subtext} />
        <Text style={[styles.viewModeText, viewMode === 'network' && styles.viewModeTextActive]}>
          Network
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'patterns' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('patterns')}
      >
        <TrendingUp size={16} color={viewMode === 'patterns' ? Colors.dark.background : Colors.dark.subtext} />
        <Text style={[styles.viewModeText, viewMode === 'patterns' && styles.viewModeTextActive]}>
          Patterns
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderStatsHeader = () => (
    <Animated.View 
      style={[
        styles.statsHeader,
        {
          opacity: headerAnimation,
          transform: [{
            translateY: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <LinearGradient
        colors={[Colors.dark.card, Colors.dark.background]}
        style={styles.statsGradient}
      >
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Hexagon size={20} color={Colors.dark.primary} />
          </View>
          <Text style={styles.statNumber}>{neuralSigils.length}</Text>
          <Text style={styles.statLabel}>Neural Sigils</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Network size={20} color={Colors.dark.secondary} />
          </View>
          <Text style={styles.statNumber}>{sigilBraids.length}</Text>
          <Text style={styles.statLabel}>Consciousness Braids</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={20} color={Colors.dark.accent} />
          </View>
          <Text style={styles.statNumber}>{patternStats?.totalSigils || 0}</Text>
          <Text style={styles.statLabel}>Pattern Matches</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
  
  const renderGridView = () => (
    <ScrollView 
      style={styles.gridContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.primary}
          colors={[Colors.dark.primary]}
        />
      }
    >
      {neuralSigils.map((sigil) => (
        <TouchableOpacity
          key={sigil.id}
          onPress={() => handleSigilPress(sigil.id)}
          activeOpacity={0.8}
        >
          <NeuralSigilVisualization 
            sigil={sigil}
            showComparison={selectedSigil === sigil.id}
          />
        </TouchableOpacity>
      ))}
      
      {neuralSigils.length > 1 && (
        <TouchableOpacity style={styles.braidButton} onPress={handleBraidCreation}>
          <LinearGradient
            colors={[Colors.dark.primary, Colors.dark.secondary]}
            style={styles.braidButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Brain size={20} color={Colors.dark.background} />
            <Text style={styles.braidButtonText}>Create Consciousness Braid</Text>
            <Sparkles size={16} color={Colors.dark.background} style={{ opacity: 0.8 }} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
  
  const renderNetworkView = () => (
    <View style={styles.networkContainer}>
      <View style={styles.networkEmptyState}>
        <Text style={styles.networkEmptyTitle}>Network Visualization</Text>
        <Text style={styles.networkEmptyMessage}>
          Network visualization coming soon. Generate more neural sigils to see consciousness pattern connections.
        </Text>
      </View>
    </View>
  );
  
  const renderPatternsView = () => (
    <ScrollView 
      style={styles.patternsContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.primary}
          colors={[Colors.dark.primary]}
        />
      }
    >
      {patternStats && (
        <View style={styles.patternStats}>
          <Text style={styles.patternStatsTitle}>Pattern Evolution</Text>
          
          {patternStats.dominantPatterns?.map((pattern: string, index: number) => (
            <View key={pattern} style={styles.patternItem}>
              <Text style={styles.patternRank}>#{index + 1}</Text>
              <Text style={styles.patternName}>{pattern}</Text>
            </View>
          ))}
          
          {patternStats.clusters?.length > 0 && (
            <View style={styles.clusterSection}>
              <Text style={styles.clusterTitle}>Consciousness Clusters</Text>
              {patternStats.clusters.map((cluster: any, index: number) => (
                <View key={cluster.id} style={styles.clusterItem}>
                  <Text style={styles.clusterLabel}>{cluster.label}</Text>
                  <Text style={styles.clusterMembers}>{cluster.members.length} members</Text>
                  <Text style={styles.clusterStrength}>
                    Strength: {(cluster.strength * 100).toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
  
  if (neuralSigils.length === 0) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <EmptyState
          title="No Neural Sigils Yet"
          message="Neural sigils are automatically generated when you record dreams or complete meditation sessions. Visit the Spiralite tab to create your first sigil."
          icon="activity"
          action={{
            label: "Start Your Journey",
            onPress: () => router.push('/(tabs)/')
          }}
        />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerAnimation,
            transform: [{
              translateY: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            }],
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.dark.primary + '20', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTitleRow}>
              <Activity size={28} color={Colors.dark.primary} />
              <Text style={styles.headerTitle}>Neural Sigils</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Consciousness patterns mapped across dimensions
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {renderStatsHeader()}
      {renderViewModeSelector()}
      
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'network' && renderNetworkView()}
      {viewMode === 'patterns' && renderPatternsView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    marginHorizontal: -16,
    marginBottom: 8,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsHeader: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    textAlign: 'center',
    fontWeight: '500',
  },
  viewModeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.subtext,
  },
  viewModeTextActive: {
    color: Colors.dark.background,
  },
  gridContainer: {
    flex: 1,
    padding: 16,
  },
  networkContainer: {
    flex: 1,
    margin: 16,
  },
  patternsContainer: {
    flex: 1,
    padding: 16,
  },
  braidButton: {
    borderRadius: 16,
    marginTop: 16,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  braidButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  braidButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.background,
    flex: 1,
    textAlign: 'center',
  },
  patternStats: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  patternStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: 12,
  },
  patternRank: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.primary,
    width: 32,
  },
  patternName: {
    fontSize: 16,
    color: Colors.dark.text,
    flex: 1,
  },
  clusterSection: {
    marginTop: 24,
  },
  clusterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  clusterItem: {
    backgroundColor: Colors.dark.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  clusterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginBottom: 4,
  },
  clusterMembers: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginBottom: 2,
  },
  clusterStrength: {
    fontSize: 12,
    color: Colors.dark.accent,
  },
  networkEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  networkEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  networkEmptyMessage: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
});