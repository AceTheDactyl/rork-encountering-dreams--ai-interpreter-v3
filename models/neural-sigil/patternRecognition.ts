import { NeuralSigil } from './sigilGenerator';

export interface PatternCluster {
  id: string;
  centroid: number[];
  members: string[];
  strength: number;
  label: string;
}

export interface SimilarPattern {
  patternId: string;
  similarity: number;
  instances: number;
  lastSeen: number;
}

export interface ClusterResult {
  clusters: PatternCluster[];
  dominantPatterns: string[];
  temporalFlow: TemporalPattern[];
}

export interface TemporalPattern {
  timeRange: { start: number; end: number };
  dominantBrainRegion: string;
  averageStrength: number;
  transitionProbabilities: Map<string, number>;
}

export class PatternRecognizer {
  private patterns: Map<string, PatternData> = new Map();
  
  async findSimilarPatterns(
    sigil: NeuralSigil, 
    threshold: number = 0.7
  ): Promise<SimilarPattern[]> {
    const similar: SimilarPattern[] = [];
    
    for (const [id, pattern] of this.patterns) {
      const similarity = this.cosineSimilarity(sigil.pattern, pattern.centroid);
      if (similarity >= threshold) {
        similar.push({
          patternId: id,
          similarity,
          instances: pattern.instances.length,
          lastSeen: pattern.lastSeen
        });
      }
    }
    
    return similar.sort((a, b) => b.similarity - a.similarity);
  }
  
  async clusterSigils(sigils: NeuralSigil[]): Promise<ClusterResult> {
    const k = Math.min(10, Math.floor(sigils.length / 5));
    const clusters = await this.kMeansClustering(sigils, k);
    
    return {
      clusters,
      dominantPatterns: this.extractDominantPatterns(clusters),
      temporalFlow: this.analyzeTemporalFlow(sigils)
    };
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
  
  private async kMeansClustering(sigils: NeuralSigil[], k: number): Promise<PatternCluster[]> {
    // Simplified k-means implementation
    const clusters: PatternCluster[] = [];
    
    // Initialize centroids randomly
    for (let i = 0; i < k; i++) {
      const centroid = Array(64).fill(0).map(() => Math.random());
      clusters.push({
        id: `cluster_${i}`,
        centroid,
        members: [],
        strength: 0,
        label: `Pattern ${i + 1}`
      });
    }
    
    // Simple assignment and update (simplified for demo)
    for (const sigil of sigils) {
      let bestCluster = 0;
      let bestSimilarity = -1;
      
      for (let i = 0; i < clusters.length; i++) {
        const similarity = this.cosineSimilarity(sigil.pattern, clusters[i].centroid);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestCluster = i;
        }
      }
      
      clusters[bestCluster].members.push(sigil.id);
      clusters[bestCluster].strength = Math.max(clusters[bestCluster].strength, bestSimilarity);
    }
    
    return clusters.filter(c => c.members.length > 0);
  }
  
  private extractDominantPatterns(clusters: PatternCluster[]): string[] {
    return clusters
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3)
      .map(c => c.id);
  }
  
  private analyzeTemporalFlow(sigils: NeuralSigil[]): TemporalPattern[] {
    // Analyze how patterns change over time
    const patterns: TemporalPattern[] = [];
    
    if (sigils.length < 2) return patterns;
    
    const sorted = [...sigils].sort((a, b) => a.timestamp - b.timestamp);
    const timeSpan = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
    const windowSize = Math.max(1, Math.floor(timeSpan / 5)); // 5 time windows
    
    for (let i = 0; i < 5; i++) {
      const windowStart = sorted[0].timestamp + (i * windowSize);
      const windowEnd = windowStart + windowSize;
      
      const windowSigils = sorted.filter(s => 
        s.timestamp >= windowStart && s.timestamp < windowEnd
      );
      
      if (windowSigils.length > 0) {
        const regionCounts = windowSigils.reduce((acc, s) => {
          acc[s.brainRegion] = (acc[s.brainRegion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const dominantRegion = Object.entries(regionCounts)
          .sort(([,a], [,b]) => b - a)[0][0];
        
        const avgStrength = windowSigils.reduce((sum, s) => sum + s.strength, 0) / windowSigils.length;
        
        patterns.push({
          timeRange: { start: windowStart, end: windowEnd },
          dominantBrainRegion: dominantRegion,
          averageStrength: avgStrength,
          transitionProbabilities: new Map()
        });
      }
    }
    
    return patterns;
  }
}

interface PatternData {
  id: string;
  centroid: number[];
  instances: NeuralSigil[];
  firstSeen: number;
  lastSeen: number;
}