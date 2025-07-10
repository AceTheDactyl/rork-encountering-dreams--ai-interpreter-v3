import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SigilGenerator, NeuralSigil, NeuralSigilGenerator } from '@/models/neural-sigil/sigilGenerator';
import { PatternRecognizer } from '@/models/neural-sigil/patternRecognition';
import { neuralSigils, getNeuralSigilByTernary, type NeuralSigilData } from '@/constants/neuralSigils';

export interface PatternMatch {
  sigilId: string;
  similarity: number;
  matchedWith: string;
  neuralSigilData?: NeuralSigilData;
}

export interface SigilBraid {
  id: string;
  sigilIds: string[];
  connections: BraidConnection[];
  strength: number;
  discoveredPatterns: string[];
  neuralConnections?: {
    brainRegions: string[];
    breathPhases: string[];
    neurochemistry: string[];
  };
}

interface BraidConnection {
  from: string;
  to: string;
  strength: number;
  type: 'temporal' | 'causal' | 'symbolic' | 'neural';
}

interface NeuralSigilState {
  neuralSigils: NeuralSigil[];
  sigilGenerator: SigilGenerator | null;
  neuralSigilGenerator: NeuralSigilGenerator | null;
  patternRecognizer: PatternRecognizer | null;
  currentSigil: NeuralSigil | null;
  patternMatches: PatternMatch[];
  sigilBraids: SigilBraid[];
  neuralSigilDatabase: NeuralSigilData[];
  searchResults: NeuralSigilData[];
  selectedCategory: string | null;
}

interface NeuralSigilActions {
  generateNeuralSigil: (text: string, type: NeuralSigil['sourceType']) => Promise<NeuralSigil>;
  generateFromNeuralSigilData: (neuralSigilData: NeuralSigilData, type: NeuralSigil['sourceType']) => Promise<NeuralSigil>;
  generateFromBreathPhase: (breathPhase: string, type?: NeuralSigil['sourceType']) => Promise<NeuralSigil>;
  findSimilarBySigil: (sigilId: string, threshold?: number) => Promise<{ sigil: NeuralSigil; similarity: number }[]>;
  braidConsciousnessStates: (stateIds: string[]) => Promise<SigilBraid>;
  recognizePattern: (sigil: NeuralSigil) => Promise<PatternMatch[]>;
  getPatternEvolution: (userId?: string) => Promise<any>;
  searchNeuralSigils: (query: string) => Promise<NeuralSigilData[]>;
  findSigilByTernary: (ternaryCode: string) => Promise<NeuralSigilData | undefined>;
  filterByCategory: (category: string | null) => void;
  initializeNeuralSystem: () => Promise<void>;
}

export const useNeuralSigilStore = create<NeuralSigilState & NeuralSigilActions>()(
  persist(
    immer((set, get) => {
      const similarityCache = new Map<string, number>();
      const getCacheKey = (id1: string, id2: string) => [id1, id2].sort().join('-');

      return {
        neuralSigils: [],
        sigilGenerator: null,
        neuralSigilGenerator: null,
        patternRecognizer: null,
        currentSigil: null,
        patternMatches: [],
        sigilBraids: [],
        neuralSigilDatabase: neuralSigils,
        searchResults: [],
        selectedCategory: null,

        initializeNeuralSystem: async () => {
          let generator = get().sigilGenerator;
          let neuralGenerator = get().neuralSigilGenerator;
          
          if (!generator) {
            generator = SigilGenerator.getInstance();
            set({ sigilGenerator: generator });
          }
          
          if (!neuralGenerator) {
            neuralGenerator = new NeuralSigilGenerator();
            await neuralGenerator.initialize();
            set({ neuralSigilGenerator: neuralGenerator });
          }
          
          console.log('Neural Sigil System initialized with', neuralSigils.length, 'neural sigils');
        },

        generateNeuralSigil: async (text, type) => {
          let generator = get().sigilGenerator;
          if (!generator) {
            generator = SigilGenerator.getInstance();
            set({ sigilGenerator: generator });
          }

          const sigil = generator.generateFromText(text, type);

          const matches: PatternMatch[] = [];
          for (const existing of get().neuralSigils) {
            const similarity = generator.calculateSimilarity(sigil, existing);
            if (similarity > 0.7) {
              matches.push({ 
                sigilId: sigil.id, 
                similarity, 
                matchedWith: existing.id,
                neuralSigilData: existing.metadata?.neuralSigilData
              });
            }
          }

          set(state => {
            state.neuralSigils.push(sigil);
            state.currentSigil = sigil;
            state.patternMatches.push(...matches);
          });

          return sigil;
        },

        generateFromNeuralSigilData: async (neuralSigilData, type) => {
          let generator = get().sigilGenerator;
          if (!generator) {
            generator = SigilGenerator.getInstance();
            set({ sigilGenerator: generator });
          }

          const sigil = generator.generateFromNeuralSigil(neuralSigilData, type);

          set(state => {
            state.neuralSigils.push(sigil);
            state.currentSigil = sigil;
          });

          return sigil;
        },

        generateFromBreathPhase: async (breathPhase, type = 'breath') => {
          let neuralGenerator = get().neuralSigilGenerator;
          if (!neuralGenerator) {
            neuralGenerator = new NeuralSigilGenerator();
            await neuralGenerator.initialize();
            set({ neuralSigilGenerator: neuralGenerator });
          }

          const sigil = await neuralGenerator.generateFromBreathPhase(breathPhase, type);

          set(state => {
            state.neuralSigils.push(sigil);
            state.currentSigil = sigil;
          });

          return sigil;
        },

        findSimilarBySigil: async (sigilId, threshold = 0.7) => {
          const { neuralSigils, sigilGenerator } = get();
          const target = neuralSigils.find(s => s.id === sigilId);
          if (!target || !sigilGenerator) return [];

          const cachedSim = (a: NeuralSigil, b: NeuralSigil) => {
            const key = getCacheKey(a.id, b.id);
            if (similarityCache.has(key)) return similarityCache.get(key)!;
            const sim = sigilGenerator.calculateSimilarity(a, b);
            similarityCache.set(key, sim);
            return sim;
          };

          return neuralSigils
            .filter(s => s.id !== sigilId)
            .map(s => ({ sigil: s, similarity: cachedSim(target, s) }))
            .filter(r => r.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity);
        },

        braidConsciousnessStates: async (stateIds) => {
          const { neuralSigils, sigilGenerator } = get();
          const sigils = neuralSigils.filter(s => stateIds.includes(s.id));
          
          if (sigils.length < 2 || !sigilGenerator) {
            throw new Error('Need at least 2 states to braid');
          }
          
          const braid: SigilBraid = {
            id: `braid_${Date.now()}`,
            sigilIds: stateIds,
            connections: [],
            strength: 0,
            discoveredPatterns: [],
            neuralConnections: {
              brainRegions: [],
              breathPhases: [],
              neurochemistry: []
            }
          };
          
          // Calculate pairwise connections
          for (let i = 0; i < sigils.length - 1; i++) {
            for (let j = i + 1; j < sigils.length; j++) {
              const similarity = sigilGenerator.calculateSimilarity(sigils[i], sigils[j]);
              if (similarity > 0.6) {
                let connectionType: BraidConnection['type'] = 'symbolic';
                
                // Determine connection type based on neural sigil data
                const sigilA = sigils[i].metadata?.neuralSigilData;
                const sigilB = sigils[j].metadata?.neuralSigilData;
                
                if (sigilA && sigilB) {
                  if (sigilA.category === sigilB.category) {
                    connectionType = 'neural';
                  } else if (sigilA.breathPhase === sigilB.breathPhase) {
                    connectionType = 'temporal';
                  }
                }
                
                braid.connections.push({
                  from: sigils[i].id,
                  to: sigils[j].id,
                  strength: similarity,
                  type: connectionType
                });
              }
            }
          }
          
          // Analyze neural connections
          const brainRegions = new Set<string>();
          const breathPhases = new Set<string>();
          const neurochemistry = new Set<string>();
          
          sigils.forEach(sigil => {
            if (sigil.metadata?.neuralSigilData) {
              const data = sigil.metadata.neuralSigilData;
              brainRegions.add(data.category);
              breathPhases.add(data.breathPhase);
              if (data.neurochemistry) {
                neurochemistry.add(data.neurochemistry);
              }
            }
          });
          
          braid.neuralConnections = {
            brainRegions: Array.from(brainRegions),
            breathPhases: Array.from(breathPhases),
            neurochemistry: Array.from(neurochemistry)
          };
          
          braid.strength = braid.connections.reduce((sum, c) => sum + c.strength, 0) 
            / Math.max(1, braid.connections.length);
          
          set(state => {
            state.sigilBraids.push(braid);
          });
          
          return braid;
        },

        recognizePattern: async (sigil) => {
          let recognizer = get().patternRecognizer;
          if (!recognizer) {
            recognizer = new PatternRecognizer();
            set({ patternRecognizer: recognizer });
          }
          
          const patterns = await recognizer.findSimilarPatterns(sigil, 0.65);
          
          const matches: PatternMatch[] = patterns.map(p => ({
            sigilId: sigil.id,
            similarity: p.similarity,
            matchedWith: p.patternId,
            neuralSigilData: sigil.metadata?.neuralSigilData
          }));
          
          set(state => {
            state.patternMatches.push(...matches);
          });
          
          return matches;
        },

        getPatternEvolution: async (userId) => {
          const { neuralSigils, patternRecognizer } = get();
          if (!patternRecognizer) return null;
          
          const userSigils = userId 
            ? neuralSigils.filter(s => s.metadata?.userId === userId)
            : neuralSigils;
          
          const clusters = await patternRecognizer.clusterSigils(userSigils);
          
          // Analyze neural sigil patterns
          const categoryDistribution = userSigils.reduce((acc, sigil) => {
            const category = sigil.metadata?.neuralSigilData?.category || 'unknown';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const breathPhaseDistribution = userSigils.reduce((acc, sigil) => {
            const breathPhase = sigil.metadata?.neuralSigilData?.breathPhase || 'unknown';
            acc[breathPhase] = (acc[breathPhase] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          return {
            clusters: clusters.clusters,
            dominantPatterns: clusters.dominantPatterns,
            temporalFlow: clusters.temporalFlow,
            totalSigils: userSigils.length,
            categoryDistribution,
            breathPhaseDistribution,
            neuralInsights: {
              mostActiveBrainRegion: Object.entries(categoryDistribution)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
              dominantBreathPhase: Object.entries(breathPhaseDistribution)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown'
            }
          };
        },

        searchNeuralSigils: async (query) => {
          let generator = get().sigilGenerator;
          if (!generator) {
            generator = SigilGenerator.getInstance();
            set({ sigilGenerator: generator });
          }

          const results = generator.searchSigils(query);
          
          set(state => {
            state.searchResults = results;
          });

          return results;
        },

        findSigilByTernary: async (ternaryCode) => {
          return getNeuralSigilByTernary(ternaryCode);
        },

        filterByCategory: (category) => {
          set(state => {
            state.selectedCategory = category;
            if (category) {
              state.searchResults = neuralSigils.filter(sigil => sigil.category === category);
            } else {
              state.searchResults = [];
            }
          });
        }
      };
    }),
    {
      name: 'neural-sigil-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        neuralSigils: state.neuralSigils.slice(-500),
        patternMatches: state.patternMatches.slice(-200),
        sigilBraids: state.sigilBraids.slice(-50),
        selectedCategory: state.selectedCategory
      }),
    }
  )
);