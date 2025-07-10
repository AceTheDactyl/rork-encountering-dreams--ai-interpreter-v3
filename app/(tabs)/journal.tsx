import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter, Hexagon, TrendingUp, BookOpen, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDreamStore } from '@/store/dreamStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import Colors from '@/constants/colors';
import DreamLogItem from '@/components/DreamLogItem';
import EmptyState from '@/components/EmptyState';
import SortButton from '@/components/SortButton';
import SortModal from '@/components/SortModal';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { getGroupedDreams, sortBy, dreams, generateDreamSigil, getDreamSigil } = useDreamStore();
  const { neuralSigils, findSimilarBySigil } = useNeuralSigilStore();
  const [refreshing, setRefreshing] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [showSigilView, setShowSigilView] = useState(false);
  const [dreamSigilStats, setDreamSigilStats] = useState({ generated: 0, total: 0 });
  const [headerAnimation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const groupedDreams = getGroupedDreams();
  const totalDreams = groupedDreams.reduce((total, group) => total + group.dreams.length, 0);
  const isGrouped = sortBy === 'type' || sortBy === 'persona';
  const isFiltered = ['mnemonic', 'psychic', 'pre-echo', 'lucid', 'meta-lucid'].includes(sortBy);
  
  useEffect(() => {
    updateSigilStats();
  }, [dreams, neuralSigils]);
  
  const updateSigilStats = () => {
    const generated = dreams.filter(dream => getDreamSigil(dream.id)).length;
    setDreamSigilStats({ generated, total: dreams.length });
  };
  
  const generateMissingSigils = async () => {
    const dreamsWithoutSigils = dreams.filter(dream => !getDreamSigil(dream.id));
    
    for (const dream of dreamsWithoutSigils) {
      try {
        await generateDreamSigil(dream.id);
      } catch (error) {
        console.error(`Failed to generate sigil for dream ${dream.id}:`, error);
      }
    }
    
    updateSigilStats();
  };
  
  // Flatten grouped dreams for FlatList
  const flattenedData = groupedDreams.flatMap(group => 
    group.dreams.map((dream, index) => ({
      ...dream,
      showGroupHeader: index === 0 && isGrouped,
      groupTitle: group.groupTitle
    }))
  );
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await generateMissingSigils();
      updateSigilStats();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dreams]);

  const getSubtitleText = () => {
    if (isFiltered) {
      const totalAllDreams = dreams.length;
      return `${totalDreams} of ${totalAllDreams} dreams shown`;
    }
    
    if (isGrouped) {
      return `${totalDreams} dream${totalDreams !== 1 ? 's' : ''} • ${groupedDreams.length} group${groupedDreams.length !== 1 ? 's' : ''}`;
    }
    
    return `${totalDreams} dream${totalDreams !== 1 ? 's' : ''} recorded`;
  };
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {totalDreams > 0 ? (
        <>
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: headerAnimation,
                transform: [{
                  translateY: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                }],
              },
            ]}
          >
            <LinearGradient
              colors={[Colors.dark.backgroundSecondary, Colors.dark.background]}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.titleRow}>
                  <View style={styles.titleIconContainer}>
                    <BookOpen size={24} color={Colors.dark.primary} />
                  </View>
                  <Text style={styles.headerTitle}>Dream Journal</Text>
                </View>
                <View style={styles.headerActions}>
                  <TouchableOpacity 
                    style={[
                      styles.sigilToggle,
                      showSigilView && styles.sigilToggleActive
                    ]}
                    onPress={() => setShowSigilView(!showSigilView)}
                  >
                    <Hexagon size={16} color={showSigilView ? Colors.dark.background : Colors.dark.primary} />
                  </TouchableOpacity>
                  <SortButton onPress={() => setSortModalVisible(true)} />
                </View>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.headerSubtitle}>
                  {getSubtitleText()}
                </Text>
                <View style={styles.sigilStats}>
                  <View style={styles.sigilStatsIcon}>
                    <Sparkles size={12} color={Colors.dark.primary} />
                  </View>
                  <Text style={styles.sigilStatsText}>
                    {dreamSigilStats.generated}/{dreamSigilStats.total} sigils
                  </Text>
                </View>
              </View>
              {dreamSigilStats.generated < dreamSigilStats.total && (
                <TouchableOpacity 
                  style={styles.generateSigilsButton}
                  onPress={generateMissingSigils}
                >
                  <LinearGradient
                    colors={[Colors.dark.primary, Colors.dark.secondary]}
                    style={styles.generateSigilsGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <TrendingUp size={14} color={Colors.dark.background} />
                    <Text style={styles.generateSigilsText}>
                      Generate {dreamSigilStats.total - dreamSigilStats.generated} Missing Sigils
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </Animated.View>
          
          <FlatList
            data={flattenedData}
            renderItem={({ item }) => (
              <DreamLogItem 
                dream={item} 
                showGroupHeader={item.showGroupHeader}
                groupTitle={item.groupTitle}
                showSigilView={showSigilView}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.dark.primary}
                colors={[Colors.dark.primary]}
              />
            }
          />
        </>
      ) : (
        <EmptyState
          title={isFiltered ? "No dreams of this type" : "No dreams recorded"}
          message={isFiltered 
            ? "Try changing the filter to see dreams of other types, or visit the Spiralite tab to record a new dream."
            : "Visit the Spiralite tab to interpret your first dream and start building your personal dream journal."
          }
          icon="moon"
        />
      )}
      
      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    marginHorizontal: -20,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.subtext,
    flex: 1,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sigilToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sigilToggleActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sigilStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sigilStatsIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.dark.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sigilStatsText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '700',
  },
  generateSigilsButton: {
    borderRadius: 20,
    marginTop: 16,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateSigilsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  generateSigilsText: {
    fontSize: 13,
    color: Colors.dark.background,
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
});