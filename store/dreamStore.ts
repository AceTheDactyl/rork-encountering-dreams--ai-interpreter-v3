import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dream } from '@/types/dream';
import { useNeuralSigilStore } from './neuralSigilStore';
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
  generateDreamSigil: (dreamId: string) => Promise<NeuralSigil | null>;
  getDreamSigil: (dreamId: string) => NeuralSigil | undefined;
  findSimilarDreams: (dreamId: string, threshold?: number) => Promise<{ dream: Dream; similarity: number }[]>;
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

export const useDreamStore = create<DreamState>()(
  persist(
    (set, get) => ({
      dreams: [],
      sortBy: 'type',
      dreamSigils: new Map(),
      addDream: (dream) => {
        console.log('DreamStore: Adding dream:', dream.name, 'with blockchain status:', dream.blockchainValidated);
        set((state) => ({ 
          dreams: [dream, ...state.dreams] 
        }));
      },
      deleteDream: (id) => set((state) => ({
        dreams: state.dreams.filter((dream) => dream.id !== id)
      })),
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
      
      generateDreamSigil: async (dreamId: string) => {
        const dream = get().getDream(dreamId);
        if (!dream) return null;
        
        try {
          const sigilStore = useNeuralSigilStore.getState();
          const dreamText = `${dream.name} - ${dream.description} - ${dream.dreamType} - ${dream.persona}`;
          const sigil = await sigilStore.generateNeuralSigil(dreamText, 'dream');
          
          // Store the sigil reference
          set(state => {
            const newSigils = new Map(state.dreamSigils);
            newSigils.set(dreamId, sigil);
            return { dreamSigils: newSigils };
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
        const sigil = get().getDreamSigil(dreamId);
        if (!sigil) return [];
        
        try {
          const sigilStore = useNeuralSigilStore.getState();
          const similarSigils = await sigilStore.findSimilarBySigil(sigil.id, threshold);
          
          const similarDreams: { dream: Dream; similarity: number }[] = [];
          
          for (const { sigil: similarSigil, similarity } of similarSigils) {
            // Find the dream that corresponds to this sigil
            for (const [dId, dSigil] of get().dreamSigils) {
              if (dSigil.id === similarSigil.id) {
                const dream = get().getDream(dId);
                if (dream) {
                  similarDreams.push({ dream, similarity });
                }
                break;
              }
            }
          }
          
          return similarDreams;
        } catch (error) {
          console.error('Error finding similar dreams:', error);
          return [];
        }
      },
    }),
    {
      name: 'spiralite-dreams',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);