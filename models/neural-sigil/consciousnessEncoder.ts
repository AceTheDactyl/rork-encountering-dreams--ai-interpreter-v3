import { BiometricData, EmotionalState } from '@/store/consciousnessStore';
import { BreathCycleLog } from '@/store/limnusStore';

export interface ConsciousnessSnapshot {
  timestamp: number;
  biometrics: BiometricData;
  emotional: EmotionalState;
  breath?: BreathCycleLog;
  coherence: number;
  depth: number;
}

export class ConsciousnessEncoder {
  encodeSnapshot(snapshot: ConsciousnessSnapshot): number[] {
    const vector: number[] = [];
    
    // Encode biometric data
    vector.push(
      snapshot.biometrics.heartRate / 100,
      snapshot.biometrics.brainwaves.alpha,
      snapshot.biometrics.brainwaves.beta,
      snapshot.biometrics.brainwaves.theta,
      snapshot.biometrics.brainwaves.delta,
      snapshot.biometrics.brainwaves.gamma || 0,
      snapshot.biometrics.breathingRate / 20,
      snapshot.biometrics.skinConductance,
      snapshot.biometrics.fibonacciRhythm || 0,
      snapshot.biometrics.goldenBreathing || 0
    );
    
    // Encode emotional state
    const emotionMap: Record<string, number> = {
      'joy': 1, 'peace': 0.8, 'neutral': 0.5, 
      'anxiety': 0.3, 'fear': 0.1, 'Neutral': 0.5,
      'Transcendent': 1, 'Flowing': 0.8, 'Awakening': 0.6,
      'Stirring': 0.4, 'Dormant': 0.2
    };
    vector.push(
      emotionMap[snapshot.emotional.hue] || 0.5,
      snapshot.emotional.intensity,
      snapshot.emotional.polarity
    );
    
    // Encode breath if available
    if (snapshot.breath) {
      vector.push(
        snapshot.breath.consciousnessScore || 0,
        snapshot.breath.breathAlignment || 0.5,
        snapshot.breath.depth / 10,
        snapshot.breath.resonance
      );
    } else {
      vector.push(0, 0.5, 0, 0);
    }
    
    // Add coherence and depth
    vector.push(snapshot.coherence, snapshot.depth / 10);
    
    // Pad or truncate to 64 dimensions
    while (vector.length < 64) vector.push(0);
    return vector.slice(0, 64);
  }
  
  decodeVector(vector: number[]): Partial<ConsciousnessSnapshot> {
    return {
      biometrics: {
        heartRate: vector[0] * 100,
        brainwaves: {
          alpha: vector[1],
          beta: vector[2],
          theta: vector[3],
          delta: vector[4],
          gamma: vector[5]
        },
        breathingRate: vector[6] * 20,
        skinConductance: vector[7],
        fibonacciRhythm: vector[8],
        goldenBreathing: vector[9]
      },
      coherence: vector[vector.length - 2],
      depth: vector[vector.length - 1] * 10
    };
  }
}