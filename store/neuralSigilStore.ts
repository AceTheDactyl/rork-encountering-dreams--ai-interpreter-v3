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
  sigils: Map<string, NeuralSigil>; // Add this for compatibility
  patternLibrary: Map<string, any>; // Add this for compatibility
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
  calculateSimilarity: (sigil1: NeuralSigil, sigil2: NeuralSigil) => number; // Add this for compatibility
}

export const useNeuralSigilStore = create<NeuralSigilState & NeuralSigilActions>()(
  persist(
    immer((set, get) => {
      const similarityCache = new Map<string, number>();
      const getCacheKey = (id1: string, id2: string) => [id1, id2].sort().join('-');

      return {
        neuralSigils: [],
        sigils: new Map<string, NeuralSigil>(),
        patternLibrary: new Map<string, any>(),
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
          try {
            let generator = get().sigilGenerator;
            let neuralGenerator = get().neuralSigilGenerator;
            let recognizer = get().patternRecognizer;
            
            if (!generator) {
              generator = SigilGenerator.getInstance();
              set({ sigilGenerator: generator });
            }
            
            if (!neuralGenerator) {
              neuralGenerator = new NeuralSigilGenerator();
              await neuralGenerator.initialize();
              set({ neuralSigilGenerator: neuralGenerator });
            }
            
            if (!recognizer) {
              recognizer = new PatternRecognizer();
              set({ patternRecognizer: recognizer });
            }
            
            console.log('Neural Sigil System initialized with', neuralSigils.length, 'neural sigils');
          } catch (error) {
            console.error('Failed to initialize neural sigil system:', error);
          }
        },

        generateNeuralSigil: async (text, type) => {
          try {
            // Import helper functions
            const { generateSigilVector, detectBrainRegion } = await import('@/utils/neuralSigilHelpers');
            
            // Ensure system is initialized
            await get().initializeNeuralSystem();
            
            let generator = get().sigilGenerator;
            if (!generator) {
              generator = SigilGenerator.getInstance();
              set({ sigilGenerator: generator });
            }

            // Create sigil using helper functions for consistency
            const vector = generateSigilVector({ text, content: text });
            const brainRegion = detectBrainRegion({ text, content: text }) as NeuralSigil['brainRegion'];
            
            const sigil: NeuralSigil = {
              id: `sigil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              pattern: new Float32Array(vector),
              brainRegion,
              timestamp: Date.now(),
              sourceType: type,
              strength: Math.random() * 0.5 + 0.5, // Random strength between 0.5-1.0
              hash: text.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0),
              metadata: { 
                text,
                generatedBy: 'neural-sigil-helpers',
                vectorDimensions: vector.length
              }
            };
            
            // Validate sigil pattern
            if (!sigil.pattern || sigil.pattern.length === 0) {
              console.warn('Generated sigil has invalid pattern, creating default');
              sigil.pattern = new Float32Array(64).fill(0.5);
            }

            const matches: PatternMatch[] = [];
            for (const existing of get().neuralSigils) {
              try {
                const { cosineSimilarity } = await import('@/utils/neuralSigilHelpers');
                const similarity = cosineSimilarity(Array.from(sigil.pattern), Array.from(existing.pattern));
                if (similarity > 0.7) {
                  matches.push({ 
                    sigilId: sigil.id, 
                    similarity, 
                    matchedWith: existing.id,
                    neuralSigilData: existing.metadata?.neuralSigilData
                  });
                }
              } catch (error) {
                console.warn('Error calculating similarity for existing sigil:', String(error));
              }
            }

            set(state => {
              state.neuralSigils.push(sigil);
              state.sigils.set(sigil.id, sigil);
              state.currentSigil = sigil;
              state.patternMatches.push(...matches);
            });

            return sigil;
          } catch (error) {
            console.error('Error generating neural sigil:', String(error));
            // Return a fallback sigil instead of throwing
            const fallbackSigil: NeuralSigil = {
              id: `fallback_${Date.now()}`,
              pattern: new Float32Array(64).fill(0.5),
              brainRegion: 'Limbic',
              timestamp: Date.now(),
              sourceType: type,
              strength: 0.5,
              hash: 0,
              metadata: { text, error: String(error) }
            };
            
            set(state => {
              state.neuralSigils.push(fallbackSigil);
              state.currentSigil = fallbackSigil;
            });
            
            return fallbackSigil;
          }
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
          try {
            // Ensure system is initialized
            await get().initializeNeuralSystem();
            
            let neuralGenerator = get().neuralSigilGenerator;
            if (!neuralGenerator) {
              neuralGenerator = new NeuralSigilGenerator();
              await neuralGenerator.initialize();
              set({ neuralSigilGenerator: neuralGenerator });
            }

            const sigil = await neuralGenerator.generateFromBreathPhase(breathPhase, type);
            
            // Validate sigil pattern
            if (!sigil.pattern || sigil.pattern.length === 0) {
              console.warn('Generated breath sigil has invalid pattern, creating default');
              sigil.pattern = new Float32Array(64).fill(0.5);
            }

            set(state => {
              state.neuralSigils.push(sigil);
              state.currentSigil = sigil;
            });

            return sigil;
          } catch (error) {
            console.error('Error generating breath phase sigil:', String(error));
            // Return a fallback sigil instead of throwing
            const fallbackSigil: NeuralSigil = {
              id: `fallback_${Date.now()}`,
              pattern: new Float32Array(64).fill(0.5),
              brainRegion: 'Cortical',
              timestamp: Date.now(),
              sourceType: type,
              strength: 0.5,
              hash: 0,
              metadata: { breathPhase }
            };
            
            set(state => {
              state.neuralSigils.push(fallbackSigil);
              state.currentSigil = fallbackSigil;
            });
            
            return fallbackSigil;
          }
        },

        findSimilarBySigil: async (sigilId, threshold = 0.7) => {
          try {
            // Import helper functions
            const { cosineSimilarity } = await import('@/utils/neuralSigilHelpers');
            
            // Ensure system is initialized
            await get().initializeNeuralSystem();
            
            const { neuralSigils } = get();
            const target = neuralSigils.find(s => s.id === sigilId);
            if (!target) return [];

            const cachedSim = (a: NeuralSigil, b: NeuralSigil) => {
              const key = getCacheKey(a.id, b.id);
              if (similarityCache.has(key)) return similarityCache.get(key)!;
              
              // Use cosine similarity from helper functions
              const sim = cosineSimilarity(Array.from(a.pattern), Array.from(b.pattern));
              similarityCache.set(key, sim);
              return sim;
            };

            return neuralSigils
              .filter(s => s.id !== sigilId)
              .map(s => ({ sigil: s, similarity: cachedSim(target, s) }))
              .filter(r => r.similarity >= threshold)
              .sort((a, b) => b.similarity - a.similarity);
          } catch (error) {
            console.error('Error finding similar sigils:', error);
            return [];
          }
        },

        braidConsciousnessStates: async (stateIds) => {
          // Ensure system is initialized
          await get().initializeNeuralSystem();
          
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
          // Ensure system is initialized
          await get().initializeNeuralSystem();
          
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
          try {
            const { neuralSigils, patternRecognizer } = get();
            if (!patternRecognizer) {
              console.warn('Pattern recognizer not initialized');
              return null;
            }
            
            const userSigils = userId 
              ? neuralSigils.filter(s => s.metadata?.userId === userId)
              : neuralSigils;
            
            if (userSigils.length === 0) {
              return {
                clusters: [],
                dominantPatterns: [],
                temporalFlow: [],
                totalSigils: 0,
                categoryDistribution: {},
                breathPhaseDistribution: {},
                neuralInsights: {
                  mostActiveBrainRegion: 'unknown',
                  dominantBreathPhase: 'unknown'
                }
              };
            }
            
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
              clusters: clusters.clusters || [],
              dominantPatterns: clusters.dominantPatterns || [],
              temporalFlow: clusters.temporalFlow || [],
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
          } catch (error) {
            console.error('Error generating sigil insights:', error);
            return {
              clusters: [],
              dominantPatterns: [],
              temporalFlow: [],
              totalSigils: 0,
              categoryDistribution: {},
              breathPhaseDistribution: {},
              neuralInsights: {
                mostActiveBrainRegion: 'unknown',
                dominantBreathPhase: 'unknown'
              }
            };
          }
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
        },
        
        calculateSimilarity: (sigil1: NeuralSigil, sigil2: NeuralSigil) => {
          try {
            // Use cosine similarity from helper functions
            const { cosineSimilarity } = require('@/utils/neuralSigilHelpers');
            return cosineSimilarity(Array.from(sigil1.pattern), Array.from(sigil2.pattern));
          } catch (error) {
            console.warn('Error calculating similarity:', error);
            return 0;
          }
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