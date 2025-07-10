import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SigilGenerator, NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import { PatternRecognizer } from '@/models/neural-sigil/patternRecognition';

export interface PatternMatch {
  sigilId: string;
  similarity: number;
  matchedWith: string;
}

export interface SigilBraid {
  id: string;
  sigilIds: string[];
  connections: BraidConnection[];
  strength: number;
  discoveredPatterns: string[];
}

interface BraidConnection {
  from: string;
  to: string;
  strength: number;
  type: 'temporal' | 'causal' | 'symbolic';
}

interface NeuralSigilState {
  neuralSigils: NeuralSigil[];
  sigilGenerator: SigilGenerator | null;
  patternRecognizer: PatternRecognizer | null;
  currentSigil: NeuralSigil | null;
  patternMatches: PatternMatch[];
  sigilBraids: SigilBraid[];
}

interface NeuralSigilActions {
  generateNeuralSigil: (text: string, type: NeuralSigil['sourceType']) => Promise<NeuralSigil>;
  findSimilarBySigil: (sigilId: string, threshold?: number) => Promise<{ sigil: NeuralSigil; similarity: number }[]>;
  braidConsciousnessStates: (stateIds: string[]) => Promise<SigilBraid>;
  recognizePattern: (sigil: NeuralSigil) => Promise<PatternMatch[]>;
  getPatternEvolution: (userId?: string) => Promise<any>;
}

export const useNeuralSigilStore = create<NeuralSigilState & NeuralSigilActions>()(
  persist(
    immer((set, get) => {
      const similarityCache = new Map<string, number>();
      const getCacheKey = (id1: string, id2: string) => [id1, id2].sort().join('-');

      return {
        neuralSigils: [],
        sigilGenerator: null,
        patternRecognizer: null,
        currentSigil: null,
        patternMatches: [],
        sigilBraids: [],

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
                matchedWith: existing.id 
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
            discoveredPatterns: []
          };
          
          // Calculate pairwise connections
          for (let i = 0; i < sigils.length - 1; i++) {
            for (let j = i + 1; j < sigils.length; j++) {
              const similarity = sigilGenerator.calculateSimilarity(sigils[i], sigils[j]);
              if (similarity > 0.6) {
                braid.connections.push({
                  from: sigils[i].id,
                  to: sigils[j].id,
                  strength: similarity,
                  type: 'symbolic'
                });
              }
            }
          }
          
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
            matchedWith: p.patternId
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
          
          return {
            clusters: clusters.clusters,
            dominantPatterns: clusters.dominantPatterns,
            temporalFlow: clusters.temporalFlow,
            totalSigils: userSigils.length
          };
        }
      };
    }),
    {
      name: 'neural-sigil-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        neuralSigils: state.neuralSigils.slice(-500),
        patternMatches: state.patternMatches.slice(-200),
        sigilBraids: state.sigilBraids.slice(-50)
      }),
    }
  )
);