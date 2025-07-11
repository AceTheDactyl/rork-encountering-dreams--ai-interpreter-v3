import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import { useConsciousnessStore } from './consciousnessStore';

export interface Dream {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  lucidity: number;
  emotionalIntensity: number;
  symbols: string[];
  interpretation?: string;
  neuralSigil?: NeuralSigil; // Add neural sigil to dream
  sigilId?: string; // Reference to stored sigil
  braidedWith?: string[]; // References to related dreams
  dreamType?: string;
  persona?: string;
}

export interface DreamGroup {
  groupTitle: string;
  dreams: Dream[];
}

export type SortBy = 'date' | 'lucidity' | 'type' | 'persona' | 'mnemonic' | 'psychic' | 'pre-echo' | 'lucid' | 'meta-lucid';

interface DreamStore {
  dreams: Dream[];
  currentDream: Dream | null;
  sortBy: SortBy;
  
  // Existing methods
  addDream: (dream: Omit<Dream, 'id' | 'timestamp'>) => Promise<Dream>;
  updateDream: (id: string, updates: Partial<Dream>) => Promise<void>;
  deleteDream: (id: string) => Promise<void>;
  loadDreams: () => Promise<void>;
  
  // Grouping and sorting methods
  getGroupedDreams: () => DreamGroup[];
  setSortBy: (sortBy: SortBy) => void;
  getDreamSigil: (dreamId: string) => NeuralSigil | undefined;
  
  // Neural sigil methods
  generateDreamSigil: (dreamId: string) => Promise<NeuralSigil>;
  findSimilarDreams: (dreamId: string, threshold?: number) => Promise<Dream[]>;
  braidDreams: (dreamIds: string[]) => Promise<void>;
  analyzeDreamPatterns: (dreamId: string) => Promise<any>;
}

export const useDreamStore = create<DreamStore>()(
  persist(
    (set, get) => ({
      dreams: [],
      currentDream: null,
      sortBy: 'date',
      
      // Set sort by method
      setSortBy: (sortBy: SortBy) => {
        set({ sortBy });
      },
      
      // Get dream sigil by dream ID
      getDreamSigil: (dreamId: string) => {
        const { dreams } = get();
        const dream = dreams.find(d => d.id === dreamId);
        return dream?.neuralSigil;
      },
      
      // Get grouped dreams based on current sort option
      getGroupedDreams: () => {
        const { dreams, sortBy } = get();
        
        // Filter dreams based on sort type
        let filteredDreams = [...dreams];
        
        if (['mnemonic', 'psychic', 'pre-echo', 'lucid', 'meta-lucid'].includes(sortBy)) {
          filteredDreams = dreams.filter(dream => dream.dreamType === sortBy);
        }
        
        // Sort dreams
        switch (sortBy) {
          case 'date':
            filteredDreams.sort((a, b) => b.timestamp - a.timestamp);
            return [{ groupTitle: 'All Dreams', dreams: filteredDreams }];
            
          case 'lucidity':
            filteredDreams.sort((a, b) => b.lucidity - a.lucidity);
            return [{ groupTitle: 'By Lucidity', dreams: filteredDreams }];
            
          case 'type':
            const typeGroups = new Map<string, Dream[]>();
            filteredDreams.forEach(dream => {
              const type = dream.dreamType || 'Unknown';
              if (!typeGroups.has(type)) {
                typeGroups.set(type, []);
              }
              typeGroups.get(type)!.push(dream);
            });
            
            return Array.from(typeGroups.entries()).map(([type, dreams]) => ({
              groupTitle: type,
              dreams: dreams.sort((a, b) => b.timestamp - a.timestamp)
            }));
            
          case 'persona':
            const personaGroups = new Map<string, Dream[]>();
            filteredDreams.forEach(dream => {
              const persona = dream.persona || 'Unknown';
              if (!personaGroups.has(persona)) {
                personaGroups.set(persona, []);
              }
              personaGroups.get(persona)!.push(dream);
            });
            
            return Array.from(personaGroups.entries()).map(([persona, dreams]) => ({
              groupTitle: persona,
              dreams: dreams.sort((a, b) => b.timestamp - a.timestamp)
            }));
            
          case 'mnemonic':
          case 'psychic':
          case 'pre-echo':
          case 'lucid':
          case 'meta-lucid':
            return [{ 
              groupTitle: `${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} Dreams`, 
              dreams: filteredDreams.sort((a, b) => b.timestamp - a.timestamp)
            }];
            
          default:
            return [{ groupTitle: 'All Dreams', dreams: filteredDreams }];
        }
      },
      
      // Enhanced addDream with neural sigil generation
      addDream: async (dreamData) => {
        const id = `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        
        // Create dream object
        const dream: Dream = {
          ...dreamData,
          id,
          timestamp,
        };
        
        // Generate neural sigil for dream
        try {
          const sigil = await get().generateDreamSigil(dream.id);
          dream.neuralSigil = sigil;
          dream.sigilId = sigil.id;
          
          // Find similar dreams automatically
          const similarDreams = await get().findSimilarDreams(dream.id, 0.7);
          if (similarDreams.length > 0) {
            // Notify user of similar dreams
            console.log(`Found ${similarDreams.length} similar dreams`);
          }
        } catch (error) {
          console.error('Failed to generate dream sigil:', error);
        }
        
        // Store dream
        const { dreams } = get();
        const updatedDreams = [...dreams, dream];
        set({ dreams: updatedDreams, currentDream: dream });
        
        return dream;
      },
      
      // Generate neural sigil for dream
      generateDreamSigil: async (dreamId: string) => {
        const { dreams } = get();
        const dream = dreams.find(d => d.id === dreamId);
        
        if (!dream) {
          throw new Error(`Dream with id ${dreamId} not found`);
        }
        
        const consciousnessStore = useConsciousnessStore.getState();
        
        // Extract dream features for sigil generation
        const dreamFeatures = {
          emotionalState: {
            intensity: dream.emotionalIntensity,
            polarity: dream.emotionalIntensity > 0.5 ? 1 : -1,
            hue: categorizeEmotion(dream.content)
          },
          dreamMetrics: {
            lucidity: dream.lucidity,
            symbolDensity: dream.symbols.length / 10,
            narrativeComplexity: calculateComplexity(dream.content),
            temporalCoherence: calculateTemporalCoherence(dream.content)
          },
          symbols: dream.symbols,
          contentEmbedding: await generateContentEmbedding(dream.content),
          dreamType: dream.dreamType,
          persona: dream.persona
        };
        
        // Generate sigil
        const sigil = await consciousnessStore.generateNeuralSigil(dreamFeatures, 'dream');
        
        return sigil;
      },
      
      // Find similar dreams by neural sigil
      findSimilarDreams: async (dreamId: string, threshold = 0.7) => {
        const { dreams } = get();
        const targetDream = dreams.find(d => d.id === dreamId);
        
        if (!targetDream || !targetDream.neuralSigil) return [];
        
        const consciousnessStore = useConsciousnessStore.getState();
        const { sigilGenerator } = consciousnessStore;
        
        const similarDreams: Dream[] = [];
        
        for (const dream of dreams) {
          if (dream.id === dreamId || !dream.neuralSigil) continue;
          
          const similarity = await sigilGenerator.compareSigils(
            targetDream.neuralSigil.pattern,
            dream.neuralSigil.pattern
          );
          
          if (similarity >= threshold) {
            similarDreams.push(dream);
          }
        }
        
        return similarDreams.sort((a, b) => b.timestamp - a.timestamp);
      },
      
      // Braid multiple dreams together
      braidDreams: async (dreamIds: string[]) => {
        const { dreams } = get();
        const consciousnessStore = useConsciousnessStore.getState();
        
        const selectedDreams = dreams.filter(d => dreamIds.includes(d.id));
        if (selectedDreams.length < 2) return;
        
        const sigils = selectedDreams
          .map(d => d.neuralSigil)
          .filter((s): s is NeuralSigil => s !== undefined);
        
        if (sigils.length >= 2) {
          // Create braided consciousness state
          const sigilIds = sigils.map(s => s.id);
          const braidResult = await consciousnessStore.braidConsciousnessStates(sigilIds);
          
          // Update dreams with braiding references
          for (const dream of selectedDreams) {
            dream.braidedWith = dreamIds.filter(id => id !== dream.id);
          }
          
          // Save updated dreams
          set({ dreams: [...dreams] });
        }
      },
      
      // Analyze dream patterns using neural sigils
      analyzeDreamPatterns: async (dreamId: string) => {
        const { dreams } = get();
        const targetDream = dreams.find(d => d.id === dreamId);
        
        if (!targetDream || !targetDream.neuralSigil) return null;
        
        const consciousnessStore = useConsciousnessStore.getState();
        
        // Find pattern matches
        const patternMatches = await consciousnessStore.recognizePattern(targetDream.neuralSigil);
        
        // Analyze brain region activation
        const brainRegions = targetDream.neuralSigil.metadata?.brainRegions || [];
        
        // Calculate dream metrics
        const analysis = {
          dominantBrainRegion: brainRegions.length > 0 ? brainRegions.reduce((max: any, region: any) => 
            region.activation > max.activation ? region : max
          ) : null,
          patternMatches,
          emotionalSignature: targetDream.neuralSigil.metadata?.emotionalFingerprint,
          sigilStrength: targetDream.neuralSigil.metadata?.strength,
          relatedDreams: await get().findSimilarDreams(dreamId, 0.6),
          timestamp: Date.now()
        };
        
        return analysis;
      },
      
      // Enhanced updateDream
      updateDream: async (id: string, updates: Partial<Dream>) => {
        const { dreams } = get();
        const dreamIndex = dreams.findIndex(d => d.id === id);
        
        if (dreamIndex === -1) return;
        
        const updatedDream = { ...dreams[dreamIndex], ...updates };
        
        // Regenerate sigil if content changed significantly
        if (updates.content || updates.symbols || updates.emotionalIntensity) {
          try {
            const newSigil = await get().generateDreamSigil(updatedDream.id);
            updatedDream.neuralSigil = newSigil;
            updatedDream.sigilId = newSigil.id;
          } catch (error) {
            console.error('Failed to regenerate dream sigil:', error);
          }
        }
        
        dreams[dreamIndex] = updatedDream;
        
        set({ dreams: [...dreams] });
      },
      
      // Other existing methods remain the same
      deleteDream: async (id: string) => {
        const { dreams } = get();
        const filteredDreams = dreams.filter(d => d.id !== id);
        
        set({ dreams: filteredDreams });
      },
      
      loadDreams: async () => {
        // Dreams are automatically loaded from persistence
        console.log('Dreams loaded from persistence');
      },
    }),
    {
      name: 'dream-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dreams: state.dreams.slice(0, 100), // Limit stored dreams
        currentDream: state.currentDream,
        sortBy: state.sortBy
      })
    }
  )
);

// Helper functions
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

async function generateContentEmbedding(content: string): Promise<number[]> {
  // Simplified embedding generation
  // In production, use a proper embedding model
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