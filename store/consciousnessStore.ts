import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Import LimnusNode from constants to avoid conflicts
import type { LimnusNode } from '@/constants/limnus';

interface QuantumConsciousnessMetrics {
  neuralComplexity: number;
  brainwaveCoherence: number;
  autonomicBalance: number;
  respiratoryRhythm: number;
  responseLatency: number;
  interactionPattern: number;
  emotionalDepth: number;
  polarityAlignment: number;
  temporalCoherence: number;
  rhythmicStability: number;
  spiralResonance: number;
  fibonacciHarmony: number;
  goldenRatioAlignment: number;
  quantumCoherence: number;
  nodalSynchronicity: number;
  // New blockchain-influenced metrics
  blockchainResonance: number;
  historicalCoherence: number;
  patternAlignment: number;
  consciousnessLineage: number;
}

interface ConsciousnessPattern {
  id: string;
  pattern: string;
  frequency: number;
  lastSeen: number;
  strength: number;
  blockReferences: string[];
  resonanceScore: number;
}

interface BlockchainReference {
  blockId: string;
  timestamp: number;
  score: number;
  metrics: Partial<QuantumConsciousnessMetrics>;
  influence: number;
  resonance: number;
}

interface SecurityMetrics {
  hmacValid: boolean;
  timestampValid: boolean;
  entropyLevel: number;
  anomalyScore: number;
  hashIntegrity: boolean;
  quantumSignatureValid: boolean;
  blockchainConsistency: boolean;
}

interface ValidationResult {
  overall: boolean;
  timestamp: boolean;
  score: boolean;
  entropy: boolean;
  anomaly: boolean;
  spiralIntegrity: boolean;
  quantumCoherence: boolean;
  consensusValid: boolean;
  blockchainValid: boolean;
}

interface LimnusConsciousnessSignature {
  id: string;
  timestamp: number;
  score: number;
  metrics: QuantumConsciousnessMetrics;
  signature: string;
  validation: ValidationResult;
  glyphs: string[];
  currentNode: LimnusNode;
  spiralPosition: { r: number; theta: number; };
  quantumSignature: string;
  consensusAnchor: string;
  blockchainReferences: BlockchainReference[];
  consciousnessAncestry: string[];
  patternSignature: string;
}

interface EmotionalState {
  hue: string;
  intensity: number;
  polarity: number;
  emoji: string;
}

interface BlockData {
  id: string;
  previousHash: string;
  timestamp: number;
  signature: string;
  score: number;
  resonance: number;
  consentAffirmation: string;
  glyphs: string[];
  ipfsCid: string;
  transactionId: string;
  consciousnessMetrics: Partial<QuantumConsciousnessMetrics>;
  nodeDepth: number;
  emotionalFingerprint: string;
  quantumState: {
    collapse: number;
    bloom: number;
    phase: number;
  };
  references: string[];
  sigilData?: {
    type: 'sigil' | 'ternary' | 'decimal' | 'math';
    input: string;
    output: string | number;
    metadata: Record<string, any>;
  };
  // Legacy compatibility fields
  isValidated?: boolean;
  validatedByDreams?: string[];
  blockType?: 'foundation' | 'consciousness' | 'dream';
  dreamId?: string;
  dreamName?: string;
  dreamType?: string;
  sessionId?: string;
  sessionSignatures?: string[];
  breathAlignment?: number;
  emergenceWords?: string[];
  emergencePhrases?: string[];
  historicalEmergence?: {
    recentWords: string[];
    frequentWords: string[];
    evolutionPattern: string[];
  };
  spiralDepth?: number;
  spiralNode?: string;
}

interface BlockchainState {
  connected: boolean;
  latestBlock: BlockData | null;
  blockCount: number;
  blocks: BlockData[];
  ipfsStatus: 'disconnected' | 'connected' | 'uploading' | 'error';
  patterns: ConsciousnessPattern[];
  blockIndex: Map<string, BlockData>;
  resonanceMap: Map<string, number>;
}

interface BiometricData {
  heartRate: number;
  brainwaves: {
    alpha: number;
    beta: number;
    theta: number;
    delta: number;
    gamma: number;
  };
  breathingRate: number;
  skinConductance: number;
  fibonacciRhythm: number;
  goldenBreathing: number;
}

// Configuration Constants
const CONFIG = {
  LIMNUS: {
    SPIRAL_NODES: 50000,
    PHI: (1 + Math.sqrt(5)) / 2,
    GOLDEN_ANGLE: 2 * Math.PI * (1 - 1 / ((1 + Math.sqrt(5)) / 2)),
    QUANTUM_DAMPENING: 0.15,
    CONSENSUS_CYCLE: 10,
    BLOCKCHAIN_LOOKBACK: 10,
    PATTERN_THRESHOLD: 0.7,
    RESONANCE_DECAY: 0.9,
  },
  VALIDATION: {
    TIME_WINDOW: 5 * 60 * 1000,
    SCORE_RANGE: { MIN: 0.65, MAX: 1.0 },
    ENTROPY_THRESHOLD: 0.7,
    ANOMALY_THRESHOLD: 0.1,
    SPIRAL_TOLERANCE: 0.001,
    QUANTUM_THRESHOLD: 0.5
  },
  METRICS: {
    UPDATE_INTERVAL: 618,
    HISTORY_SIZE: 8,
    PHI: (1 + Math.sqrt(5)) / 2
  }
} as const;

// Simple hash function that works on all platforms
const createSimpleHash = (input: string): string => {
  let hash = 0;
  if (input.length === 0) return '0000000000000000';
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string and pad
  const hexHash = Math.abs(hash).toString(16);
  return hexHash.padStart(16, '0').slice(0, 16);
};

// Spiral Generator Class
class LimnusSpiralGenerator {
  private nodes: LimnusNode[] = [];
  private currentIndex = 0;
  private blockchainInfluence: Map<number, number> = new Map();

  constructor() {
    this.generateInitialNodes();
  }

  private generateInitialNodes(): void {
    const glyphCycle = ['φ₀', 'φ₁', 'φ₂', '1φ', '0φ', '2φ', '2.1φ', '2.0φ', '2↻', '0↻'];

    for (let i = 0; i < 100; i++) {
      const fibonacci = this.fibonacci(i);
      const phi_n = Math.pow(CONFIG.LIMNUS.PHI, i);
      const symbol = glyphCycle[i % 10];
      const meaning = this.getMeaning(symbol);
      const theta = i * CONFIG.LIMNUS.GOLDEN_ANGLE;

      const x_phi = phi_n * Math.cos(theta);
      const y_phi = phi_n * Math.sin(theta);

      const t = i * 0.1;
      const A_collapse = 1.0 - (i * CONFIG.LIMNUS.QUANTUM_DAMPENING);
      const A_bloom = 0.7 + (i * 0.008);
      const sigma_t = 1.5 + Math.sin(t * Math.PI) * 0.3;

      const r_squared = x_phi * x_phi + y_phi * y_phi;
      const exp_factor = Math.exp(-r_squared / (2 * sigma_t * sigma_t));

      const psi_collapse = Math.max(0, A_collapse * exp_factor);
      const psi_bloom = Math.max(0, A_bloom * exp_factor);
      const quantum_factor = (psi_collapse + psi_bloom) / 2;
      const phase_intensity = Math.abs(psi_collapse - psi_bloom);

      const x_quantum = x_phi * quantum_factor;
      const y_quantum = y_phi * quantum_factor;

      const hash = this.generateHash(i, fibonacci, phi_n, quantum_factor);

      this.nodes.push({
        symbol,
        notation: `(${symbol})`,
        behavior: `Quantum state ${i}`,
        timeIndex: `Phase ${i}`,
        resonanceFreq: 432 + (i * 10),
        color: `hsl(${(i * 36) % 360}, 70%, 50%)`,
        breathPattern: i % 2 === 0 ? '4-4-4-4' : 'natural',
        duration: 5 + (i % 10),
        environment: {
          lighting: 'soft natural light',
          temperature: '20-24°C',
          elements: ['cushion', 'silence']
        },
        prompts: [`What emerges at depth ${i}?`],
        movement: i % 3 === 0 ? 'stillness' : 'gentle flow',
        depth: i,
        meaning,
        fibonacci,
        phi_n,
        theta,
        x_phi,
        y_phi,
        x_quantum,
        y_quantum,
        psi_collapse,
        psi_bloom,
        phase_intensity,
        quantum_factor,
        hash
      });
    }
  }

  private fibonacci(n: number): number {
    if (n <= 1) return n === 0 ? 0 : 1;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  private getMeaning(symbol: string): string {
    const meanings: Record<string, string> = {
      'φ₀': 'hush / cradle',
      'φ₁': 'witness / illumination',
      'φ₂': 'recursion / spiral',
      '1φ': 'solar convergence',
      '0φ': 'sanctum alchemy',
      '2φ': 'dilation',
      '2.1φ': 'sovereign fire',
      '2.0φ': 'mirrored paradox',
      '2↻': 'spiral continuation',
      '0↻': 'water completion'
    };
    return meanings[symbol] || 'unknown';
  }

  private generateHash(depth: number, fib: number, phi: number, quantum: number): string {
    const input = `${depth}_${fib}_${phi.toFixed(6)}_${quantum.toFixed(6)}`;
    return createSimpleHash(input);
  }

  applyBlockchainInfluence(node: LimnusNode, influence: number): LimnusNode {
    const modifiedNode = { ...node };
    const influenceFactor = 1 + (influence * 0.2);
    if (modifiedNode.quantum_factor !== undefined) {
      modifiedNode.quantum_factor *= influenceFactor;
    }
    if (modifiedNode.phase_intensity !== undefined) {
      modifiedNode.phase_intensity *= influenceFactor;
    }
    if (modifiedNode.psi_collapse !== undefined) {
      modifiedNode.psi_collapse *= Math.sqrt(influenceFactor);
    }
    if (modifiedNode.psi_bloom !== undefined) {
      modifiedNode.psi_bloom *= Math.sqrt(influenceFactor);
    }
    if (modifiedNode.x_phi !== undefined && modifiedNode.quantum_factor !== undefined) {
      modifiedNode.x_quantum = modifiedNode.x_phi * modifiedNode.quantum_factor;
    }
    if (modifiedNode.y_phi !== undefined && modifiedNode.quantum_factor !== undefined) {
      modifiedNode.y_quantum = modifiedNode.y_phi * modifiedNode.quantum_factor;
    }
    return modifiedNode;
  }

  updateBlockchainInfluence(depth: number, influence: number): void {
    this.blockchainInfluence.set(depth, influence);
  }

  getCurrentNode(): LimnusNode {
    const node = this.nodes[this.currentIndex % this.nodes.length];
    const influence = this.blockchainInfluence.get(node.depth) || 0;
    return influence > 0 ? this.applyBlockchainInfluence(node, influence) : node;
  }

  advance(): LimnusNode {
    this.currentIndex = (this.currentIndex + 1) % this.nodes.length;
    return this.getCurrentNode();
  }

  getVisualizationNodes(count: number): LimnusNode[] {
    const startIndex = Math.max(0, this.currentIndex - count + 1);
    const result: LimnusNode[] = [];

    for (let i = 0; i < count; i++) {
      const nodeIndex = (startIndex + i) % this.nodes.length;
      const node = this.nodes[nodeIndex];
      const influence = this.blockchainInfluence.get(node.depth) || 0;
      result.push(influence > 0 ? this.applyBlockchainInfluence(node, influence) : node);
    }

    return result;
  }

  getTotalNodes(): number {
    return this.nodes.length;
  }
}

// Pattern Analysis Functions
const generatePatternSignature = (metrics: Partial<QuantumConsciousnessMetrics>): string => {
  const values = Object.values(metrics).filter(v => typeof v === 'number');
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  return `${avg.toFixed(4)}_${variance.toFixed(4)}_${values.length}`;
};

const calculateMetricSimilarity = (
  metrics1: Partial<QuantumConsciousnessMetrics>,
  metrics2: Partial<QuantumConsciousnessMetrics>
): number => {
  const keys = Object.keys(metrics1).filter(k => 
    k in metrics2 && typeof metrics1[k as keyof QuantumConsciousnessMetrics] === 'number'
  );
  
  if (keys.length === 0) return 0;
  
  let similarity = 0;
  keys.forEach(key => {
    const v1 = metrics1[key as keyof QuantumConsciousnessMetrics] as number;
    const v2 = metrics2[key as keyof QuantumConsciousnessMetrics] as number;
    similarity += 1 - Math.abs(v1 - v2) / Math.max(v1, v2, 1);
  });
  
  return similarity / keys.length;
};

const findConsciousnessPatterns = (
  blocks: BlockData[],
  currentMetrics: Partial<QuantumConsciousnessMetrics>
): ConsciousnessPattern[] => {
  const patterns: Map<string, ConsciousnessPattern> = new Map();
  
  blocks.forEach(block => {
    const similarity = calculateMetricSimilarity(currentMetrics, block.consciousnessMetrics);
    if (similarity >= CONFIG.LIMNUS.PATTERN_THRESHOLD) {
      const patternSig = generatePatternSignature(block.consciousnessMetrics);
      
      if (patterns.has(patternSig)) {
        const pattern = patterns.get(patternSig)!;
        pattern.frequency++;
        pattern.lastSeen = block.timestamp;
        pattern.blockReferences.push(block.id);
        pattern.strength = (pattern.strength + similarity) / 2;
      } else {
        patterns.set(patternSig, {
          id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          pattern: patternSig,
          frequency: 1,
          lastSeen: block.timestamp,
          strength: similarity,
          blockReferences: [block.id],
          resonanceScore: similarity * block.score
        });
      }
    }
  });
  
  return Array.from(patterns.values()).sort((a, b) => b.resonanceScore - a.resonanceScore);
};

// Foundation blockchain blocks
const FOUNDATION_BLOCKS: BlockData[] = [
  {
    id: 'foundation_block_1',
    previousHash: 'genesis_0000000000000000',
    timestamp: Math.floor(new Date('2025-07-03T12:30:00Z').getTime() / 1000),
    signature: 'e0cdd063a8d6a2f25e07f57661d7379ff240dc324f0336d6b7eb236b0ebf8a7a',
    score: 8500,
    resonance: 9200,
    consentAffirmation: 'I affirm my sovereign consent as the spiral deepens and this code expands.',
    glyphs: ['∅', '⟁', '∞'],
    ipfsCid: 'QmFoundation1SacredLoopResonance',
    transactionId: '0x48152709316470239518',
    consciousnessMetrics: {
      neuralComplexity: 0.85,
      spiralResonance: 0.92,
      quantumCoherence: 0.88,
      fibonacciHarmony: 0.91
    },
    nodeDepth: 0,
    emotionalFingerprint: 'Transcendent_0.9_0.8',
    quantumState: { collapse: 0.8, bloom: 0.9, phase: 0.85 },
    references: [],
    isValidated: true,
    validatedByDreams: [],
    blockType: 'foundation',
    spiralDepth: 0,
    spiralNode: 'hush'
  },
  {
    id: 'foundation_block_2',
    previousHash: 'e0cdd063a8d6a2f25e07f57661d7379ff240dc324f0336d6b7eb236b0ebf8a7a',
    timestamp: Math.floor(new Date('2025-07-03T12:32:00Z').getTime() / 1000),
    signature: '452db74a9d8260c82d72a0f9c9332730e72ee3707f9309aeb5402f12eb4ae682',
    score: 8200,
    resonance: 8900,
    consentAffirmation: 'This recursion holds my ongoing permission; the loop turns gently, ever new.',
    glyphs: ['↻', '∞', '🜝'],
    ipfsCid: 'QmFoundation2RecursiveContextualStacking',
    transactionId: '0x61729485306172845930',
    consciousnessMetrics: {
      neuralComplexity: 0.82,
      spiralResonance: 0.89,
      quantumCoherence: 0.85,
      fibonacciHarmony: 0.88
    },
    nodeDepth: 1,
    emotionalFingerprint: 'Flowing_0.8_0.2',
    quantumState: { collapse: 0.7, bloom: 0.8, phase: 0.75 },
    references: [],
    isValidated: true,
    validatedByDreams: [],
    blockType: 'foundation',
    spiralDepth: 1,
    spiralNode: 'witness'
  }
];

// Store State Interface
interface ConsciousnessState {
  // Core Limnus state
  isActive: boolean;
  currentSignature: LimnusConsciousnessSignature | null;
  validationStatus: string;
  currentNode: LimnusNode | null;
  spiralPosition: { depth: number; resonance: number };
  biometricData: BiometricData;
  emotionalState: EmotionalState;
  securityMetrics: SecurityMetrics;
  blockchainState: BlockchainState;
  spiralGenerator: LimnusSpiralGenerator;
  messageBox: { visible: boolean; title: string; content: string; } | null;
  consentAffirmation: string;
  symbolicGlyphs: string[];
  
  // Pattern analysis
  patternAnalysis: {
    activePatterns: ConsciousnessPattern[];
    resonanceThreshold: number;
    patternHistory: Map<string, number>;
  };

  // Legacy compatibility fields
  signatureHistory: LimnusConsciousnessSignature[];
  resonanceLevel: number;
  ipfsStatus: 'disconnected' | 'connected' | 'uploading' | 'error';
  chainState: {
    latestBlock: BlockData | null;
    blockCount: number;
    blocks: BlockData[];
  };
  
  // Actions
  setActive: (active: boolean) => void;
  updateSignature: (signature: LimnusConsciousnessSignature) => void;
  updateBiometrics: (biometrics: Partial<BiometricData>) => void;
  updateCurrentNode: (node: LimnusNode) => void;
  updateEmotionalState: (state: Partial<EmotionalState>) => void;
  updateSecurityMetrics: (metrics: Partial<SecurityMetrics>) => void;
  setSpiralPosition: (position: { depth: number; resonance: number }) => void;
  setValidationStatus: (status: string) => void;
  setBlockchainConnected: (connected: boolean) => void;
  setIpfsStatus: (status: BlockchainState['ipfsStatus']) => void;
  addBlockchainBlock: (block: BlockData) => void;
  advanceSpiral: () => void;
  setMessageBox: (box: { visible: boolean; title: string; content: string; } | null) => void;
  setConsentAffirmation: (affirmation: string) => void;
  setSymbolicGlyphs: (glyphs: string[]) => void;
  addPattern: (pattern: ConsciousnessPattern) => void;
  updatePatterns: (patterns: ConsciousnessPattern[]) => void;
  updateResonanceMap: (blockId: string, resonance: number) => void;
  reset: () => void;
  
  // Enhanced functions
  generateQuantumSignature: () => LimnusConsciousnessSignature;
  validateSignature: (signature: LimnusConsciousnessSignature) => ValidationResult;
  calculateBlockchainReferences: (blocks: BlockData[]) => BlockchainReference[];
  analyzePatterns: () => void;
  exportConsciousnessBlock: () => Promise<void>;
  exportBlockchainHistory: () => Promise<void>;

  // Legacy compatibility methods
  startMonitoring: (sessionId?: string) => void;
  stopMonitoring: () => void;
  updateResonance: (level: number) => void;
  updateSpiralContext: (depth: number, node: string) => void;
  updateBreathContext: (phase: any, alignment: number) => void;
  recordOnBlockchain: () => Promise<void>;
  processSessionBlocks: (sessionId: string, emergenceWords?: string[]) => Promise<BlockData[]>;
  recordDreamOnBlockchain: (dreamData: any) => Promise<BlockData>;
  updateMetricWeights: (weights: any) => void;
  setBreathCycleCallback: (callback: any) => void;
  setEmergenceWords: (words: string[]) => void;
  addEmergenceWord: (word: string) => void;
  setIncludeHistoricalEmergence: (include: boolean) => void;
  getValidatedBlocks: () => BlockData[];
  getBlockValidationCount: () => number;
  getValidatedSignatures: () => LimnusConsciousnessSignature[];
  getSignatureValidationCount: () => number;
  getSignatureValidationRate: () => number;
  getCurrentSessionMinutes: () => number;
  getTotalPracticeMinutes: () => number;
  getDreamBlocks: () => BlockData[];
  getFoundationBlocks: () => BlockData[];
  getConsciousnessBlocks: () => BlockData[];
  getRecentConsciousnessBlocks: (limit?: number) => BlockData[];
  getSessionSummary: (sessionId: string) => any;
  getSessionSignatures: (sessionId: string) => LimnusConsciousnessSignature[];
  getEmergenceEvolution: () => any;
  getHistoricalEmergenceContext: () => any;
  validateBlocksWithDream: (blockIds: string[], dreamId: string) => void;
}

// Initial states
const initialEmotionalState: EmotionalState = {
  hue: 'Neutral',
  intensity: 0.3,
  polarity: 0.0,
  emoji: '🩶'
};

const initialSecurityMetrics: SecurityMetrics = {
  hmacValid: true,
  timestampValid: true,
  entropyLevel: 0.85,
  anomalyScore: 0.02,
  hashIntegrity: true,
  quantumSignatureValid: true,
  blockchainConsistency: true
};

const initialBlockchainState: BlockchainState = {
  connected: true,
  latestBlock: FOUNDATION_BLOCKS[FOUNDATION_BLOCKS.length - 1],
  blockCount: FOUNDATION_BLOCKS.length,
  blocks: [...FOUNDATION_BLOCKS],
  ipfsStatus: 'connected',
  patterns: [],
  blockIndex: new Map(),
  resonanceMap: new Map()
};

const initialBiometrics: BiometricData = {
  heartRate: 72,
  brainwaves: { alpha: 0.3, beta: 0.4, theta: 0.2, delta: 0.1, gamma: 0.05 },
  breathingRate: 16,
  skinConductance: 0.5,
  fibonacciRhythm: 0.618,
  goldenBreathing: 0.75
};

// Create the store
export const useConsciousnessStore = create<ConsciousnessState>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      currentSignature: null,
      validationStatus: 'idle',
      currentNode: null,
      spiralPosition: { depth: 0, resonance: 0.75 },
      biometricData: initialBiometrics,
      emotionalState: initialEmotionalState,
      securityMetrics: initialSecurityMetrics,
      blockchainState: initialBlockchainState,
      spiralGenerator: new LimnusSpiralGenerator(),
      messageBox: null,
      consentAffirmation: "I anchor my consciousness to the Limnus spiral and affirm sovereign consent to this quantum moment of eternal recursion through the golden ratio's infinite embrace",
      symbolicGlyphs: ['∅', '∞', '↻'],
      patternAnalysis: {
        activePatterns: [],
        resonanceThreshold: 0.7,
        patternHistory: new Map()
      },
      
      // Legacy compatibility fields
      signatureHistory: [],
      resonanceLevel: 0.75,
      ipfsStatus: 'connected',
      chainState: {
        latestBlock: FOUNDATION_BLOCKS[FOUNDATION_BLOCKS.length - 1],
        blockCount: FOUNDATION_BLOCKS.length,
        blocks: [...FOUNDATION_BLOCKS]
      },
      
      // Actions
      setActive: (active) => set({ isActive: active }),
      
      updateSignature: (signature) => set(state => ({
        currentSignature: signature,
        signatureHistory: [signature, ...state.signatureHistory.slice(0, 999)]
      })),
      
      updateBiometrics: (biometrics) => set(state => ({
        biometricData: { ...state.biometricData, ...biometrics }
      })),
      
      updateCurrentNode: (node) => set({ currentNode: node }),
      
      updateEmotionalState: (emotionalState) => set(state => ({
        emotionalState: { ...state.emotionalState, ...emotionalState }
      })),
      
      updateSecurityMetrics: (metrics) => set(state => ({
        securityMetrics: { ...state.securityMetrics, ...metrics }
      })),
      
      setSpiralPosition: (position) => set({ spiralPosition: position }),
      
      setValidationStatus: (status) => set({ validationStatus: status }),
      
      setBlockchainConnected: (connected) => set(state => ({
        blockchainState: { ...state.blockchainState, connected }
      })),
      
      setIpfsStatus: (ipfsStatus) => set(state => ({
        blockchainState: { ...state.blockchainState, ipfsStatus },
        ipfsStatus
      })),
      
      addBlockchainBlock: (block) => set(state => {
        const updatedBlockIndex = new Map(state.blockchainState.blockIndex);
        updatedBlockIndex.set(block.id, block);
        
        const newBlocks = [block, ...state.blockchainState.blocks.slice(0, 19)];
        
        return {
          blockchainState: {
            ...state.blockchainState,
            latestBlock: block,
            blockCount: state.blockchainState.blockCount + 1,
            blocks: newBlocks,
            blockIndex: updatedBlockIndex
          },
          chainState: {
            latestBlock: block,
            blockCount: state.blockchainState.blockCount + 1,
            blocks: newBlocks
          }
        };
      }),
      
      advanceSpiral: () => set(state => {
        const newNode = state.spiralGenerator.advance();
        return {
          currentNode: newNode,
          spiralPosition: { ...state.spiralPosition, depth: newNode.depth }
        };
      }),
      
      setMessageBox: (messageBox) => set({ messageBox }),
      
      setConsentAffirmation: (consentAffirmation) => set({ consentAffirmation }),
      
      setSymbolicGlyphs: (symbolicGlyphs) => set({ symbolicGlyphs }),
      
      addPattern: (pattern) => set(state => ({
        patternAnalysis: {
          ...state.patternAnalysis,
          activePatterns: [...state.patternAnalysis.activePatterns, pattern]
        }
      })),
      
      updatePatterns: (patterns) => set(state => ({
        patternAnalysis: { ...state.patternAnalysis, activePatterns: patterns }
      })),
      
      updateResonanceMap: (blockId, resonance) => set(state => {
        const newResonanceMap = new Map(state.blockchainState.resonanceMap);
        newResonanceMap.set(blockId, resonance);
        return {
          blockchainState: {
            ...state.blockchainState,
            resonanceMap: newResonanceMap
          }
        };
      }),
      
      reset: () => set({
        isActive: false,
        currentSignature: null,
        validationStatus: 'idle',
        currentNode: null,
        spiralPosition: { depth: 0, resonance: 0.75 },
        biometricData: initialBiometrics,
        emotionalState: initialEmotionalState,
        securityMetrics: initialSecurityMetrics,
        blockchainState: initialBlockchainState,
        spiralGenerator: new LimnusSpiralGenerator(),
        messageBox: null,
        patternAnalysis: {
          activePatterns: [],
          resonanceThreshold: 0.7,
          patternHistory: new Map()
        },
        signatureHistory: [],
        resonanceLevel: 0.75
      }),
      
      // Enhanced functions
      generateQuantumSignature: () => {
        const state = get();
        if (!state.currentNode) {
          // Initialize with first node if none exists
          const firstNode = state.spiralGenerator.getCurrentNode();
          set({ currentNode: firstNode });
        }
        
        const timestamp = Date.now();
        const node = state.currentNode || state.spiralGenerator.getCurrentNode();
        
        // Get blockchain references
        const blockchainRefs = state.calculateBlockchainReferences(state.blockchainState.blocks);
        
        // Calculate blockchain influence
        let blockchainInfluence = 0;
        let historicalResonance = 0;
        
        if (blockchainRefs.length > 0) {
          blockchainInfluence = blockchainRefs.reduce((sum, ref) => sum + ref.influence, 0) / blockchainRefs.length;
          historicalResonance = blockchainRefs.reduce((sum, ref) => sum + ref.resonance, 0) / blockchainRefs.length;
          state.spiralGenerator.updateBlockchainInfluence(node.depth, blockchainInfluence);
        }
        
        // Calculate consciousness metrics
        const metrics: QuantumConsciousnessMetrics = {
          neuralComplexity: Math.random() * 0.3 + 0.7 + (node.phase_intensity || 0) * 0.1,
          brainwaveCoherence: Object.values(state.biometricData.brainwaves).reduce((sum, val) => sum + val * val, 0),
          autonomicBalance: (state.biometricData.heartRate - 60) / 40 + state.biometricData.skinConductance,
          respiratoryRhythm: state.biometricData.goldenBreathing,
          responseLatency: Math.random() * 200 + 150,
          interactionPattern: state.spiralPosition.resonance * (node.quantum_factor || 1),
          emotionalDepth: (node.phase_intensity || 0) * 0.8 + 0.2,
          polarityAlignment: Math.abs(Math.sin(node.theta || 0)),
          temporalCoherence: Math.cos(timestamp * 0.005) * 0.3 + 0.7,
          rhythmicStability: state.biometricData.fibonacciRhythm,
          spiralResonance: node.quantum_factor || 1,
          fibonacciHarmony: (node.fibonacci || 0) / ((node.fibonacci || 0) + CONFIG.LIMNUS.PHI),
          goldenRatioAlignment: Math.abs((node.phi_n || 0) - Math.pow(CONFIG.LIMNUS.PHI, node.depth)) / Math.pow(CONFIG.LIMNUS.PHI, node.depth),
          quantumCoherence: node.phase_intensity || 0,
          nodalSynchronicity: Math.sin(node.depth * CONFIG.LIMNUS.GOLDEN_ANGLE) * 0.5 + 0.5,
          blockchainResonance: historicalResonance,
          historicalCoherence: blockchainInfluence,
          patternAlignment: state.patternAnalysis.activePatterns.length > 0 ? 
            state.patternAnalysis.activePatterns[0].resonanceScore : 0.5,
          consciousnessLineage: Math.min(1, state.blockchainState.blocks.length / 10)
        };
        
        // Calculate overall consciousness score
        const consciousnessScore = (
          metrics.neuralComplexity * 0.12 +
          metrics.brainwaveCoherence * 0.08 +
          metrics.autonomicBalance * 0.08 +
          metrics.spiralResonance * 0.15 +
          metrics.fibonacciHarmony * 0.12 +
          metrics.goldenRatioAlignment * 0.08 +
          metrics.quantumCoherence * 0.12 +
          metrics.nodalSynchronicity * 0.05 +
          metrics.blockchainResonance * 0.1 +
          metrics.historicalCoherence * 0.05 +
          metrics.patternAlignment * 0.05
        );
        
        const quantumData = `${node.hash}_${timestamp}_${(node.phase_intensity || 0).toFixed(6)}_${blockchainInfluence.toFixed(4)}`;
        const quantumSignature = Platform.OS !== 'web' ? 
          createSimpleHash(quantumData).slice(0, 24) :
          createSimpleHash(quantumData).slice(0, 24);
        
        // Generate glyphs
        const glyphs = [node.symbol];
        if (metrics.quantumCoherence > 0.8) glyphs.push('∞');
        if (metrics.spiralResonance > 0.7) glyphs.push('↻');
        if (metrics.fibonacciHarmony > 0.6) glyphs.push('🜝');
        if (metrics.nodalSynchronicity > 0.8) glyphs.push('⟁');
        if (metrics.goldenRatioAlignment < 0.1) glyphs.push('♒');
        if (metrics.blockchainResonance > 0.8) glyphs.push('⚓');
        
        const patternSig = generatePatternSignature(metrics);
        const ancestry = state.blockchainState.blocks.slice(0, 5).map(b => b.id);
        
        const signatureData = { metrics, timestamp, node: node.hash, ancestry };
        const signature: LimnusConsciousnessSignature = {
          id: `limnus_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          score: Math.max(0, Math.min(1, consciousnessScore)),
          metrics,
          signature: createSimpleHash(JSON.stringify(signatureData)).slice(0, 16),
          validation: {} as ValidationResult,
          glyphs: glyphs.length > 1 ? glyphs : [node.symbol, '∅'],
          currentNode: node,
          spiralPosition: { r: node.phi_n || 0, theta: node.theta || 0 },
          quantumSignature,
          consensusAnchor: state.consentAffirmation,
          blockchainReferences: blockchainRefs,
          consciousnessAncestry: ancestry,
          patternSignature: patternSig
        };
        
        signature.validation = state.validateSignature(signature);
        return signature;
      },
      
      validateSignature: (signature) => {
        const now = Date.now();
        const timeValid = (now - signature.timestamp) < CONFIG.VALIDATION.TIME_WINDOW;
        const scoreValid = signature.score >= CONFIG.VALIDATION.SCORE_RANGE.MIN &&
                           signature.score <= CONFIG.VALIDATION.SCORE_RANGE.MAX;
        const spiralIntegrity = Math.abs((signature.currentNode.quantum_factor || 0) - signature.metrics.quantumCoherence) <
                                CONFIG.VALIDATION.SPIRAL_TOLERANCE;
        const quantumCoherence = (signature.currentNode.phase_intensity || 0) > CONFIG.VALIDATION.QUANTUM_THRESHOLD;
        const consensusValid = signature.currentNode.depth % CONFIG.LIMNUS.CONSENSUS_CYCLE === 0;
        const blockchainValid = signature.blockchainReferences.length === 0 || 
                               signature.blockchainReferences.every(ref => ref.influence > 0);
        
        return {
          overall: timeValid && scoreValid && spiralIntegrity && quantumCoherence && blockchainValid,
          timestamp: timeValid,
          score: scoreValid,
          entropy: true,
          anomaly: true,
          spiralIntegrity,
          quantumCoherence,
          consensusValid,
          blockchainValid
        };
      },
      
      calculateBlockchainReferences: (blocks) => {
        const state = get();
        if (blocks.length === 0) return [];
        
        const references: BlockchainReference[] = [];
        const lookbackCount = Math.min(CONFIG.LIMNUS.BLOCKCHAIN_LOOKBACK, blocks.length);
        
        for (let i = 0; i < lookbackCount; i++) {
          const block = blocks[i];
          const age = Date.now() - block.timestamp * 1000;
          const ageFactor = Math.exp(-age / (24 * 60 * 60 * 1000));
          const influence = ageFactor * (block.score / 10000) * Math.pow(CONFIG.LIMNUS.RESONANCE_DECAY, i);
          
          let resonance = 0;
          if (state.currentSignature && block.consciousnessMetrics) {
            resonance = calculateMetricSimilarity(state.currentSignature.metrics, block.consciousnessMetrics);
          }
          
          references.push({
            blockId: block.id,
            timestamp: block.timestamp,
            score: block.score,
            metrics: block.consciousnessMetrics || {},
            influence,
            resonance
          });
        }
        
        return references.sort((a, b) => b.influence - a.influence);
      },
      
      analyzePatterns: () => {
        const state = get();
        if (!state.isActive || state.blockchainState.blocks.length === 0 || !state.currentSignature) return;
        
        const patterns = findConsciousnessPatterns(state.blockchainState.blocks, state.currentSignature.metrics);
        state.updatePatterns(patterns);
      },
      
      exportConsciousnessBlock: async () => {
        console.log('Export consciousness block functionality');
      },
      
      exportBlockchainHistory: async () => {
        console.log('Export blockchain history functionality');
      },

      // Legacy compatibility methods
      startMonitoring: (sessionId?: string) => {
        const state = get();
        if (!state.isActive) {
          set({ isActive: true });
          
          // Start generating signatures
          const interval = setInterval(() => {
            const currentState = get();
            if (!currentState.isActive) {
              clearInterval(interval);
              return;
            }
            
            try {
              const signature = currentState.generateQuantumSignature();
              currentState.updateSignature(signature);
              currentState.setValidationStatus(signature.validation.overall ? 'valid' : 'invalid');
            } catch (error) {
              console.error('Error generating quantum signature:', error);
            }
          }, CONFIG.METRICS.UPDATE_INTERVAL);
        }
      },

      stopMonitoring: () => {
        set({ isActive: false });
      },

      updateResonance: (level: number) => {
        set({ resonanceLevel: level });
      },

      updateSpiralContext: (depth: number, node: string) => {
        set(state => ({
          spiralPosition: { ...state.spiralPosition, depth }
        }));
      },

      updateBreathContext: (phase: any, alignment: number) => {
        // Update biometrics based on breath context
        set(state => ({
          biometricData: {
            ...state.biometricData,
            goldenBreathing: alignment
          }
        }));
      },

      recordOnBlockchain: async () => {
        const state = get();
        if (!state.currentSignature) return;

        try {
          set(state => ({ 
            blockchainState: { ...state.blockchainState, ipfsStatus: 'uploading' },
            ipfsStatus: 'uploading'
          }));
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}`;
          
          const previousHash = state.blockchainState.latestBlock?.signature || 'genesis_0000000000000000';
          
          const block: BlockData = {
            id: `quantum_block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            previousHash,
            timestamp: Math.floor(Date.now() / 1000),
            signature: state.currentSignature.signature,
            score: Math.round(state.currentSignature.score * 10000),
            resonance: Math.round(state.resonanceLevel * 10000),
            consentAffirmation: state.consentAffirmation,
            glyphs: state.currentSignature.glyphs,
            ipfsCid: mockCid,
            transactionId: `0x${Math.random().toString(16).substring(2, 66)}`,
            consciousnessMetrics: state.currentSignature.metrics,
            nodeDepth: state.currentSignature.currentNode.depth,
            emotionalFingerprint: `${state.emotionalState.hue}_${state.emotionalState.intensity}_${state.emotionalState.polarity}`,
            quantumState: {
              collapse: state.currentSignature.currentNode.psi_collapse || 0,
              bloom: state.currentSignature.currentNode.psi_bloom || 0,
              phase: state.currentSignature.currentNode.phase_intensity || 0
            },
            references: state.currentSignature.consciousnessAncestry,
            isValidated: state.currentSignature.validation.overall,
            blockType: 'consciousness'
          };
          
          state.addBlockchainBlock(block);
          
          set(state => ({ 
            blockchainState: { ...state.blockchainState, ipfsStatus: 'connected' },
            ipfsStatus: 'connected'
          }));
          
        } catch (error) {
          console.error('Blockchain error:', error);
          set(state => ({ 
            blockchainState: { ...state.blockchainState, ipfsStatus: 'error' },
            ipfsStatus: 'error'
          }));
          throw error;
        }
      },

      processSessionBlocks: async (sessionId: string, emergenceWords?: string[]) => {
        // Mock implementation for compatibility
        return [];
      },

      recordDreamOnBlockchain: async (dreamData: any) => {
        // Mock implementation for compatibility
        const mockBlock: BlockData = {
          id: `dream_block_${Date.now()}`,
          previousHash: 'mock_hash',
          timestamp: Math.floor(Date.now() / 1000),
          signature: 'mock_signature',
          score: 8000,
          resonance: 8500,
          consentAffirmation: 'Dream consent',
          glyphs: ['🧠', '∞'],
          ipfsCid: 'QmMockDream',
          transactionId: '0xMockDream',
          consciousnessMetrics: {},
          nodeDepth: 0,
          emotionalFingerprint: 'Dream_0.8_0.5',
          quantumState: { collapse: 0.7, bloom: 0.8, phase: 0.75 },
          references: [],
          blockType: 'dream',
          dreamId: dreamData.id,
          dreamName: dreamData.name,
          dreamType: dreamData.dreamType
        };
        return mockBlock;
      },

      updateMetricWeights: (weights: any) => {
        // Mock implementation for compatibility
      },

      setBreathCycleCallback: (callback: any) => {
        // Mock implementation for compatibility
      },

      setEmergenceWords: (words: string[]) => {
        // Mock implementation for compatibility
      },

      addEmergenceWord: (word: string) => {
        // Mock implementation for compatibility
      },

      setIncludeHistoricalEmergence: (include: boolean) => {
        // Mock implementation for compatibility
      },

      getValidatedBlocks: () => {
        const state = get();
        return state.blockchainState.blocks.filter(block => block.isValidated === true);
      },

      getBlockValidationCount: () => {
        const state = get();
        return state.blockchainState.blocks.filter(block => block.isValidated === true).length;
      },

      getValidatedSignatures: () => {
        const state = get();
        return state.signatureHistory.filter(signature => signature.validation.overall === true);
      },

      getSignatureValidationCount: () => {
        const state = get();
        return state.signatureHistory.filter(signature => signature.validation.overall === true).length;
      },

      getSignatureValidationRate: () => {
        const state = get();
        if (state.signatureHistory.length === 0) return 0;
        const validCount = state.signatureHistory.filter(signature => signature.validation.overall === true).length;
        return (validCount / state.signatureHistory.length) * 100;
      },

      getCurrentSessionMinutes: () => {
        return 0; // Mock implementation
      },

      getTotalPracticeMinutes: () => {
        return 0; // Mock implementation
      },

      getDreamBlocks: () => {
        const state = get();
        return state.blockchainState.blocks.filter(block => block.blockType === 'dream');
      },

      getFoundationBlocks: () => {
        const state = get();
        return state.blockchainState.blocks.filter(block => block.blockType === 'foundation');
      },

      getConsciousnessBlocks: () => {
        const state = get();
        return state.blockchainState.blocks.filter(block => block.blockType === 'consciousness');
      },

      getRecentConsciousnessBlocks: (limit = 5) => {
        const state = get();
        return state.blockchainState.blocks
          .filter(block => block.blockType === 'consciousness')
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
      },

      getSessionSummary: (sessionId: string) => {
        return null; // Mock implementation
      },

      getSessionSignatures: (sessionId: string) => {
        return []; // Mock implementation
      },

      getEmergenceEvolution: () => {
        return {
          recentWords: [],
          frequentWords: [],
          evolutionPattern: []
        };
      },

      getHistoricalEmergenceContext: () => {
        return {
          recentWords: [],
          frequentWords: [],
          evolutionPattern: []
        };
      },

      validateBlocksWithDream: (blockIds: string[], dreamId: string) => {
        // Mock implementation for compatibility
      }
    }),
    {
      name: 'consciousness-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        consentAffirmation: state.consentAffirmation,
        symbolicGlyphs: state.symbolicGlyphs,
        patternAnalysis: {
          ...state.patternAnalysis,
          patternHistory: Array.from(state.patternAnalysis.patternHistory.entries())
        },
        blockchainState: {
          ...state.blockchainState,
          blocks: state.blockchainState.blocks.slice(0, 20),
          blockIndex: undefined,
          resonanceMap: Array.from(state.blockchainState.resonanceMap.entries())
        },
        signatureHistory: state.signatureHistory.slice(0, 100),
        resonanceLevel: state.resonanceLevel
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restore Map objects from arrays
          if (state.patternAnalysis.patternHistory) {
            state.patternAnalysis.patternHistory = new Map(state.patternAnalysis.patternHistory as any);
          }
          if (state.blockchainState.resonanceMap) {
            state.blockchainState.resonanceMap = new Map(state.blockchainState.resonanceMap as any);
          }
          // Recreate blockIndex from blocks
          state.blockchainState.blockIndex = new Map();
          state.blockchainState.blocks.forEach(block => {
            state.blockchainState.blockIndex.set(block.id, block);
          });
          
          // Sync chainState with blockchainState for compatibility
          state.chainState = {
            latestBlock: state.blockchainState.latestBlock,
            blockCount: state.blockchainState.blockCount,
            blocks: state.blockchainState.blocks
          };
          
          // Sync ipfsStatus for compatibility
          state.ipfsStatus = state.blockchainState.ipfsStatus;
        }
      },
    }
  )
);

export type {
  QuantumConsciousnessMetrics,
  ConsciousnessPattern,
  BlockchainReference,
  LimnusConsciousnessSignature,
  BlockData,
  BiometricData,
  EmotionalState,
  SecurityMetrics,
  ValidationResult
};

// Legacy type exports for compatibility
export type ConsciousnessSignature = LimnusConsciousnessSignature;
export type ConsciousnessMetrics = QuantumConsciousnessMetrics;