import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dream } from '@/types/dream';
import { useNeuralSigilStore } from './neuralSigilStore';
import { useConsciousnessStore } from './consciousnessStore';
import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';

export type SortOption = 'type' | 'persona' | 'mnemonic' | 'psychic' | 'pre-echo' | 'lucid' | 'meta-lucid';

interface DreamState {
  dreams: Dream[];
  sortBy: SortOption;
  dreamSigils: Map<string, NeuralSigil>;
  addDream: (dream: Dream) => void;
  deleteDream: (id: string) => void;
  getDream: (id: string) => Dream | undefined;
  setSortBy: (sortBy: SortOption) => void;
  getSortedDreams: () => Dream[];
  getGroupedDreams: () => { groupTitle: string; dreams: Dream[] }[];
  validateDreamWithBlockchain: (dreamId: string, alignedBlocks: string[]) => void;
  getValidatedDreams: () => Dream[];
  updateDreamBlockchainStatus: (dreamId: string, blockchainValidated: boolean, alignedBlocks?: string[]) => void;
  
  // Neural sigil methods
  generateDreamSigil: (dreamId: string) => Promise<NeuralSigil | null>;
  getDreamSigil: (dreamId: string) => NeuralSigil | undefined;
  findSimilarDreams: (dreamId: string, threshold?: number) => Promise<{ dream: Dream; similarity: number }[]>;
  braidDreams: (dreamIds: string[]) => Promise<void>;
  analyzeDreamPatterns: (dreamId: string) => Promise<any>;
  updateDream: (id: string, updates: Partial<Dream>) => Promise<void>;
}

const filterAndSortDreams = (dreams: Dream[], sortBy: SortOption): Dream[] => {
  let filteredDreams = [...dreams];
  
  // Filter by specific dream type if selected
  if (['mnemonic', 'psychic', 'pre-echo', 'lucid', 'meta-lucid'].includes(sortBy)) {
    filteredDreams = dreams.filter(dream => dream.dreamType === sortBy);
  }
  
  // Always sort by date desc within filtered results
  return filteredDreams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const groupDreams = (dreams: Dream[], sortBy: SortOption): { groupTitle: string; dreams: Dream[] }[] => {
  // For specific dream type filters, don't group - just return all dreams
  if (['mnemonic', 'psychic', 'pre-echo', 'lucid', 'meta-lucid'].includes(sortBy)) {
    return [{ groupTitle: '', dreams }];
  }

  // For 'type' and 'persona' sorting, group the dreams
  const groups: { [key: string]: Dream[] } = {};
  
  dreams.forEach(dream => {
    let groupKey = '';
    
    if (sortBy === 'type') {
      // Map dream type IDs to readable names
      const typeNames: { [key: string]: string } = {
        'mnemonic': 'Mnemonic Dreams',
        'psychic': 'Psychic Dreams',
        'pre-echo': 'Pre-Echo Dreams',
        'lucid': 'Lucid Dreams',
        'meta-lucid': 'Meta-Lucid Dreams'
      };
      groupKey = typeNames[dream.dreamType] || dream.dreamType;
    } else if (sortBy === 'persona') {
      groupKey = dream.persona === 'orion' ? 'Orion' : 'Limnus';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(dream);
  });

  return Object.entries(groups).map(([groupTitle, dreams]) => ({
    groupTitle,
    dreams: dreams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }));
};

// Helper functions for neural sigil generation
function categorizeEmotion(content: string): string {
  const emotions = {
    Intense: ['fear', 'anger', 'passion', 'excitement'],
    Reverent: ['awe', 'wonder', 'sacred', 'divine'],
    Reflective: ['contemplative', 'peaceful', 'serene', 'calm'],
    Collapsing: ['anxiety', 'chaos', 'confusion', 'dissolution'],
    Transcendent: ['unity', 'oneness', 'infinite', 'eternal']
  };
  
  const lowerContent = content.toLowerCase();
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return emotion;
    }
  }
  
  return 'Neutral';
}

function calculateComplexity(content: string): number {
  // Simple complexity metric based on sentence structure
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  
  return Math.min(1, avgSentenceLength / 20);
}

function calculateTemporalCoherence(content: string): number {
  // Check for temporal markers
  const temporalMarkers = ['then', 'after', 'before', 'suddenly', 'meanwhile', 'later'];
  const markerCount = temporalMarkers.filter(marker => 
    content.toLowerCase().includes(marker)
  ).length;
  
  return Math.min(1, markerCount / 5);
}

function extractSymbols(content: string): string[] {
  // Extract potential symbols from dream content
  const symbolKeywords = [
    'water', 'fire', 'earth', 'air', 'tree', 'mountain', 'ocean', 'sky',
    'door', 'window', 'bridge', 'path', 'road', 'house', 'building',
    'animal', 'bird', 'snake', 'cat', 'dog', 'wolf', 'bear',
    'light', 'darkness', 'shadow', 'mirror', 'key', 'book', 'flower'
  ];
  
  const lowerContent = content.toLowerCase();
  return symbolKeywords.filter(symbol => lowerContent.includes(symbol));
}

async function generateContentEmbedding(content: string): Promise<number[]> {
  // Simplified embedding generation
  const words = content.toLowerCase().split(/\s+/);
  const embedding = new Array(64).fill(0);
  
  words.forEach((word, i) => {
    const hash = word.split('').reduce((h, c) => h + c.charCodeAt(0), 0);
    embedding[hash % 64] += 1;
  });
  
  // Normalize
  const max = Math.max(...embedding);
  return embedding.map(v => v / (max || 1));
}

export const useDreamStore = create<DreamState>()(
  persist(
    (set, get) => ({
      dreams: [],
      sortBy: 'type',
      dreamSigils: new Map(),
      
      addDream: (dream) => {
        console.log('DreamStore: Adding dream:', dream.name, 'with blockchain status:', dream.blockchainValidated);
        
        // Auto-generate neural sigil for new dreams
        setTimeout(async () => {
          try {
            await get().generateDreamSigil(dream.id);
          } catch (error) {
            console.error('Failed to auto-generate sigil for new dream:', error);
          }
        }, 100);
        
        set((state) => ({ 
          dreams: [dream, ...state.dreams] 
        }));
      },
      
      deleteDream: (id) => set((state) => {
        // Remove sigil when deleting dream
        const newSigils = new Map(state.dreamSigils);
        newSigils.delete(id);
        
        return {
          dreams: state.dreams.filter((dream) => dream.id !== id),
          dreamSigils: newSigils
        };
      }),
      
      getDream: (id) => get().dreams.find((dream) => dream.id === id),
      setSortBy: (sortBy) => set({ sortBy }),
      getSortedDreams: () => {
        const { dreams, sortBy } = get();
        return filterAndSortDreams(dreams, sortBy);
      },
      getGroupedDreams: () => {
        const { dreams, sortBy } = get();
        const filteredDreams = filterAndSortDreams(dreams, sortBy);
        return groupDreams(filteredDreams, sortBy);
      },
      
      validateDreamWithBlockchain: (dreamId: string, alignedBlocks: string[]) => {
        console.log('DreamStore: Validating dream with blockchain:', dreamId, alignedBlocks);
        set(state => ({
          dreams: state.dreams.map(dream => 
            dream.id === dreamId 
              ? { 
                  ...dream, 
                  blockchainValidated: true, 
                  alignedBlocks: [...(dream.alignedBlocks || []), ...alignedBlocks]
                }
              : dream
          )
        }));
      },
      
      updateDreamBlockchainStatus: (dreamId: string, blockchainValidated: boolean, alignedBlocks?: string[]) => {
        console.log('DreamStore: Updating dream blockchain status:', dreamId, blockchainValidated);
        set(state => ({
          dreams: state.dreams.map(dream => 
            dream.id === dreamId 
              ? { 
                  ...dream, 
                  blockchainValidated,
                  alignedBlocks: alignedBlocks || dream.alignedBlocks || []
                }
              : dream
          )
        }));
      },
      
      getValidatedDreams: () => {
        const state = get();
        return state.dreams.filter(dream => dream.blockchainValidated);
      },
      
      // Neural sigil methods
      generateDreamSigil: async (dreamId: string) => {
        const dream = get().getDream(dreamId);
        if (!dream) return null;
        
        try {
          const consciousnessStore = useConsciousnessStore.getState();
          
          // Extract dream features for sigil generation
          const symbols = dream.symbols || extractSymbols(dream.text);
          const emotionalIntensity = dream.emotionalIntensity || 0.5;
          const lucidity = dream.lucidity || 0.3;
          
          const dreamFeatures = {
            emotionalState: {
              intensity: emotionalIntensity,
              polarity: emotionalIntensity > 0.5 ? 1 : -1,
              hue: categorizeEmotion(dream.text)
            },
            dreamMetrics: {
              lucidity: lucidity,
              symbolDensity: symbols.length / 10,
              narrativeComplexity: calculateComplexity(dream.text),
              temporalCoherence: calculateTemporalCoherence(dream.text)
            },
            symbols: symbols,
            contentEmbedding: await generateContentEmbedding(dream.text),
            dreamType: dream.dreamType,
            persona: dream.persona,
            interpretation: dream.interpretation
          };
          
          // Generate sigil using consciousness store
          const sigil = await consciousnessStore.generateNeuralSigil(dreamFeatures, 'dream');
          
          // Store the sigil reference
          set(state => {
            const newSigils = new Map(state.dreamSigils);
            newSigils.set(dreamId, sigil);
            
            // Update dream with sigil reference
            const updatedDreams = state.dreams.map(d => 
              d.id === dreamId 
                ? { 
                    ...d, 
                    sigilId: sigil.id,
                    symbols: symbols,
                    emotionalIntensity: emotionalIntensity,
                    lucidity: lucidity,
                    temporalCoherence: calculateTemporalCoherence(dream.text),
                    narrativeComplexity: calculateComplexity(dream.text)
                  }
                : d
            );
            
            return { 
              dreamSigils: newSigils,
              dreams: updatedDreams
            };
          });
          
          return sigil;
        } catch (error) {
          console.error('Error generating dream sigil:', error);
          return null;
        }
      },
      
      getDreamSigil: (dreamId: string) => {
        return get().dreamSigils.get(dreamId);
      },
      
      findSimilarDreams: async (dreamId: string, threshold = 0.7) => {
        const { dreams, dreamSigils } = get();
        const targetSigil = dreamSigils.get(dreamId);
        
        if (!targetSigil) return [];
        
        try {
          const consciousnessStore = useConsciousnessStore.getState();
          const { sigilGenerator } = consciousnessStore;
          
          const similarDreams: { dream: Dream; similarity: number }[] = [];
          
          for (const dream of dreams) {
            if (dream.id === dreamId) continue;
            
            const dreamSigil = dreamSigils.get(dream.id);
            if (!dreamSigil) continue;
            
            const similarity = await sigilGenerator.compareSigils(
              targetSigil.pattern,
              dreamSigil.pattern
            );
            
            if (similarity >= threshold) {
              similarDreams.push({ dream, similarity });
            }
          }
          
          return similarDreams.sort((a, b) => b.similarity - a.similarity);
        } catch (error) {
          console.error('Error finding similar dreams:', error);
          return [];
        }
      },
      
      braidDreams: async (dreamIds: string[]) => {
        const { dreams, dreamSigils } = get();
        
        if (dreamIds.length < 2) return;
        
        try {
          const consciousnessStore = useConsciousnessStore.getState();
          const selectedDreams = dreams.filter(d => dreamIds.includes(d.id));
          const sigils = dreamIds
            .map(id => dreamSigils.get(id))
            .filter((s): s is NeuralSigil => s !== undefined);
          
          if (sigils.length >= 2) {
            // Create braided consciousness state
            const sigilIds = sigils.map(s => s.id);
            const braidResult = await consciousnessStore.braidConsciousnessStates(sigilIds);
            
            // Update dreams with braiding references
            set(state => ({
              dreams: state.dreams.map(dream => 
                dreamIds.includes(dream.id)
                  ? { ...dream, braidedWith: dreamIds.filter(id => id !== dream.id) }
                  : dream
              )
            }));
          }
        } catch (error) {
          console.error('Error braiding dreams:', error);
        }
      },
      
      analyzeDreamPatterns: async (dreamId: string) => {
        const { dreams, dreamSigils } = get();
        const targetDream = dreams.find(d => d.id === dreamId);
        const targetSigil = dreamSigils.get(dreamId);
        
        if (!targetDream || !targetSigil) return null;
        
        try {
          const consciousnessStore = useConsciousnessStore.getState();
          
          // Find pattern matches
          const patternMatches = await consciousnessStore.recognizePattern(targetSigil);
          
          // Calculate dream metrics
          const analysis = {
            brainRegion: targetSigil.brainRegion,
            patternMatches,
            emotionalSignature: categorizeEmotion(targetDream.text),
            sigilStrength: targetSigil.strength,
            relatedDreams: await get().findSimilarDreams(dreamId, 0.6),
            symbols: targetDream.symbols || [],
            lucidity: targetDream.lucidity || 0,
            emotionalIntensity: targetDream.emotionalIntensity || 0,
            temporalCoherence: targetDream.temporalCoherence || 0,
            narrativeComplexity: targetDream.narrativeComplexity || 0,
            timestamp: Date.now()
          };
          
          return analysis;
        } catch (error) {
          console.error('Error analyzing dream patterns:', error);
          return null;
        }
      },
      
      updateDream: async (id: string, updates: Partial<Dream>) => {
        set(state => {
          const dreamIndex = state.dreams.findIndex(d => d.id === id);
          if (dreamIndex === -1) return state;
          
          const updatedDream = { ...state.dreams[dreamIndex], ...updates };
          const updatedDreams = [...state.dreams];
          updatedDreams[dreamIndex] = updatedDream;
          
          return { dreams: updatedDreams };
        });
        
        // Regenerate sigil if content changed significantly
        if (updates.text || updates.symbols || updates.emotionalIntensity) {
          try {
            await get().generateDreamSigil(id);
          } catch (error) {
            console.error('Error regenerating sigil after dream update:', error);
          }
        }
      },
    }),
    {
      name: 'spiralite-dreams',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dreams: state.dreams,
        sortBy: state.sortBy,
        dreamSigils: Array.from(state.dreamSigils.entries())
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.dreamSigils) {
          // Restore Map from array
          state.dreamSigils = new Map(state.dreamSigils as any);
        }
      },
    }
  )
);