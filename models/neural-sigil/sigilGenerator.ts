import * as tf from '@tensorflow/tfjs';

export interface NeuralSigil {
  id: string;
  pattern: Float32Array;
  brainRegion: 'Cortical' | 'Limbic' | 'Brainstem' | 'Thalamic';
  timestamp: number;
  sourceType: 'dream' | 'meditation' | 'breath' | 'composite' | 'consciousness';
  strength: number;
  hash: number;
  metadata?: {
    spiralDepth?: number;
    breathPhase?: string;
    emotionalState?: string;
    consciousnessScore?: number;
    triggeredBy?: string;
    userId?: string;
    [key: string]: any;
  };
}

export class SigilGenerator {
  private static instance: SigilGenerator;
  private encoder: tf.Sequential | null = null;

  private constructor() {}

  public static getInstance(): SigilGenerator {
    if (!SigilGenerator.instance) {
      SigilGenerator.instance = new SigilGenerator();
    }
    return SigilGenerator.instance;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  public generateFromText(text: string, sourceType: NeuralSigil['sourceType']): NeuralSigil {
    const hash = this.simpleHash(text);
    const rand = this.seededRandom(hash);
    const pattern = new Float32Array(64);
    for (let i = 0; i < 64; i++) {
      pattern[i] = rand();
    }
    const regions: NeuralSigil['brainRegion'][] = ['Cortical', 'Limbic', 'Brainstem', 'Thalamic'];
    const region = regions[hash % regions.length];

    return {
      id: `sigil_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      pattern,
      brainRegion: region,
      timestamp: Date.now(),
      sourceType,
      strength: 0.5 + rand() * 0.5,
      hash,
      metadata: {}
    };
  }

  public calculateSimilarity(a: NeuralSigil, b: NeuralSigil): number {
    const pA = a.pattern;
    const pB = b.pattern;
    const dot = pA.reduce((sum, x, i) => sum + x * pB[i], 0);
    const magA = Math.sqrt(pA.reduce((sum, x) => sum + x * x, 0));
    const magB = Math.sqrt(pB.reduce((sum, x) => sum + x * x, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }
}

// New NeuralSigilGenerator class for the consciousness store
export class NeuralSigilGenerator {
  private sigilGenerator: SigilGenerator;

  constructor() {
    this.sigilGenerator = SigilGenerator.getInstance();
  }

  async initialize(): Promise<void> {
    console.log('NeuralSigilGenerator initialized');
  }

  async createSigil(data: {
    metrics: any;
    biometrics: any;
    emotionalState: any;
    [key: string]: any;
  }): Promise<NeuralSigil> {
    const text = JSON.stringify(data);
    const sigil = this.sigilGenerator.generateFromText(text, 'consciousness');
    
    // Add additional metadata from the input data
    sigil.metadata = {
      ...sigil.metadata,
      consciousnessScore: data.metrics?.quantumCoherence || 0.5,
      emotionalState: data.emotionalState?.hue || 'Neutral',
      heartRate: data.biometrics?.heartRate || 72,
      timestamp: Date.now()
    };

    return sigil;
  }

  async compareSigils(patternA: Float32Array, patternB: Float32Array): Promise<number> {
    const dot = patternA.reduce((sum, x, i) => sum + x * patternB[i], 0);
    const magA = Math.sqrt(patternA.reduce((sum, x) => sum + x * x, 0));
    const magB = Math.sqrt(patternB.reduce((sum, x) => sum + x * x, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }
}