import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';

export interface BraidPattern {
  id: string;
  type: 'temporal' | 'causal' | 'resonant' | 'symbolic';
  strength: number;
  participants: string[];
  emergentProperties: Record<string, any>;
}

export interface BraidResult {
  id: string;
  combinedPattern: Float32Array;
  participantSigils: string[];
  braidStrength: number;
  emergentProperties: Record<string, any>;
  timestamp: number;
}

export class SigilBraider {
  analyzeBraidPattern(sigils: NeuralSigil[]): BraidPattern[] {
    const patterns: BraidPattern[] = [];
    
    // Temporal patterns - sigils that occur in sequence
    const temporalPatterns = this.findTemporalPatterns(sigils);
    patterns.push(...temporalPatterns);
    
    // Causal patterns - sigils that trigger other sigils
    const causalPatterns = this.findCausalPatterns(sigils);
    patterns.push(...causalPatterns);
    
    // Resonant patterns - sigils with high similarity
    const resonantPatterns = this.findResonantPatterns(sigils);
    patterns.push(...resonantPatterns);
    
    // Symbolic patterns - sigils sharing brain regions or metadata
    const symbolicPatterns = this.findSymbolicPatterns(sigils);
    patterns.push(...symbolicPatterns);
    
    return patterns;
  }

  async braid(sigils: NeuralSigil[]): Promise<BraidResult> {
    if (sigils.length < 2) {
      throw new Error('Need at least 2 sigils to braid');
    }

    // Combine patterns using weighted average
    const combinedPattern = new Float32Array(64);
    const totalWeight = sigils.reduce((sum, sigil) => sum + sigil.strength, 0);

    for (let i = 0; i < 64; i++) {
      let weightedSum = 0;
      for (const sigil of sigils) {
        weightedSum += sigil.pattern[i] * (sigil.strength / totalWeight);
      }
      combinedPattern[i] = weightedSum;
    }

    // Calculate braid strength
    const braidStrength = sigils.reduce((sum, sigil) => sum + sigil.strength, 0) / sigils.length;

    // Extract emergent properties
    const emergentProperties: Record<string, any> = {
      brainRegions: [...new Set(sigils.map(s => s.brainRegion))],
      sourceTypes: [...new Set(sigils.map(s => s.sourceType))],
      averageStrength: braidStrength,
      participantCount: sigils.length,
      temporalSpan: Math.max(...sigils.map(s => s.timestamp)) - Math.min(...sigils.map(s => s.timestamp))
    };

    return {
      id: `braid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      combinedPattern,
      participantSigils: sigils.map(s => s.id),
      braidStrength,
      emergentProperties,
      timestamp: Date.now()
    };
  }
  
  private findTemporalPatterns(sigils: NeuralSigil[]): BraidPattern[] {
    const patterns: BraidPattern[] = [];
    const sorted = [...sigils].sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const timeDiff = sorted[i + 1].timestamp - sorted[i].timestamp;
      
      // If sigils occur within 5 minutes, consider them temporally linked
      if (timeDiff < 5 * 60 * 1000) {
        const emergentProperties: Record<string, any> = {
          timeDiff: timeDiff,
          sequence: [sorted[i].id, sorted[i + 1].id]
        };
        
        patterns.push({
          id: `temporal_${sorted[i].id}_${sorted[i + 1].id}`,
          type: 'temporal',
          strength: 1 - (timeDiff / (5 * 60 * 1000)),
          participants: [sorted[i].id, sorted[i + 1].id],
          emergentProperties
        });
      }
    }
    
    return patterns;
  }
  
  private findCausalPatterns(sigils: NeuralSigil[]): BraidPattern[] {
    // Analyze metadata and content for causal relationships
    const patterns: BraidPattern[] = [];
    
    for (const sigil of sigils) {
      if (sigil.metadata?.triggeredBy) {
        const trigger = sigils.find(s => s.id === sigil.metadata!.triggeredBy);
        if (trigger) {
          const emergentProperties: Record<string, any> = {
            cause: trigger.id,
            effect: sigil.id
          };
          
          patterns.push({
            id: `causal_${trigger.id}_${sigil.id}`,
            type: 'causal',
            strength: 0.9,
            participants: [trigger.id, sigil.id],
            emergentProperties
          });
        }
      }
    }
    
    return patterns;
  }
  
  private findResonantPatterns(sigils: NeuralSigil[]): BraidPattern[] {
    const patterns: BraidPattern[] = [];
    
    for (let i = 0; i < sigils.length - 1; i++) {
      for (let j = i + 1; j < sigils.length; j++) {
        const similarity = this.calculateSimilarity(sigils[i], sigils[j]);
        
        if (similarity > 0.8) {
          const emergentProperties: Record<string, any> = {
            similarity: similarity,
            resonance: 'high'
          };
          
          patterns.push({
            id: `resonant_${sigils[i].id}_${sigils[j].id}`,
            type: 'resonant',
            strength: similarity,
            participants: [sigils[i].id, sigils[j].id],
            emergentProperties
          });
        }
      }
    }
    
    return patterns;
  }
  
  private findSymbolicPatterns(sigils: NeuralSigil[]): BraidPattern[] {
    const patterns: BraidPattern[] = [];
    
    // Group by brain region
    const regionGroups = new Map<string, NeuralSigil[]>();
    for (const sigil of sigils) {
      const group = regionGroups.get(sigil.brainRegion) || [];
      group.push(sigil);
      regionGroups.set(sigil.brainRegion, group);
    }
    
    // Create patterns for groups with multiple sigils
    for (const [region, group] of regionGroups) {
      if (group.length > 2) {
        const emergentProperties: Record<string, any> = {
          region: region,
          count: group.length
        };
        
        patterns.push({
          id: `symbolic_${region}_${Date.now()}`,
          type: 'symbolic',
          strength: group.length / sigils.length,
          participants: group.map(s => s.id),
          emergentProperties
        });
      }
    }
    
    return patterns;
  }

  private calculateSimilarity(a: NeuralSigil, b: NeuralSigil): number {
    const pA = a.pattern;
    const pB = b.pattern;
    const dot = pA.reduce((sum, x, i) => sum + x * pB[i], 0);
    const magA = Math.sqrt(pA.reduce((sum, x) => sum + x * x, 0));
    const magB = Math.sqrt(pB.reduce((sum, x) => sum + x * x, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }
}