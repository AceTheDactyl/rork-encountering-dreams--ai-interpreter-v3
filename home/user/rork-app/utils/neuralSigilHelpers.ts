// Neural Sigil Helper Functions

export function generateSigilVector(data: any): number[] {
  // Generate 64-dimensional vector based on content
  const vector = new Array(64).fill(0);
  
  const text = data.text || data.content || '';
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  // Encode different aspects into vector segments
  // 0-15: Emotional tone
  const emotionalWords = ['fear', 'joy', 'anger', 'love', 'peace', 'anxiety', 'wonder', 'awe'];
  emotionalWords.forEach((word, i) => {
    if (text.toLowerCase().includes(word)) {
      vector[i] = Math.min(1, vector[i] + 0.3);
    }
  });
  
  // 16-31: Symbolic content
  const symbols = ['water', 'fire', 'earth', 'air', 'light', 'dark', 'spiral', 'circle', 'tree', 'mountain', 'ocean', 'sky', 'door', 'bridge', 'mirror', 'key'];
  symbols.forEach((symbol, i) => {
    if (text.toLowerCase().includes(symbol)) {
      vector[16 + i] = Math.min(1, vector[16 + i] + 0.4);
    }
  });
  
  // 32-47: Narrative structure
  const narrativeMarkers = ['then', 'suddenly', 'after', 'before', 'while', 'during', 'next', 'finally'];
  narrativeMarkers.forEach((marker, i) => {
    if (text.toLowerCase().includes(marker)) {
      vector[32 + i] = Math.min(1, vector[32 + i] + 0.2);
    }
  });
  
  // 48-63: Consciousness depth indicators
  const consciousnessWords = ['aware', 'lucid', 'conscious', 'realize', 'understand', 'know', 'feel', 'sense', 'perceive', 'experience', 'transcend', 'unity', 'oneness', 'infinite', 'eternal', 'divine'];
  consciousnessWords.forEach((word, i) => {
    if (text.toLowerCase().includes(word)) {
      vector[48 + i] = Math.min(1, vector[48 + i] + 0.5);
    }
  });
  
  // Add word frequency encoding
  words.forEach((word, i) => {
    const hash = word.split('').reduce((h, c) => h + c.charCodeAt(0), 0);
    const index = hash % 64;
    vector[index] = Math.min(1, vector[index] + 0.1);
  });
  
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
}

export function detectBrainRegion(data: any): string {
  const text = (data.text || data.content || '').toLowerCase();
  
  // Analyze content to determine primary brain region
  const emotionalWords = countEmotionalWords(text);
  const logicalStructure = analyzeLogicalStructure(text);
  const primalThemes = detectPrimalThemes(text);
  const integrationMarkers = detectIntegrationMarkers(text);
  
  // Determine dominant brain region based on content analysis
  if (primalThemes > 0.5) return 'brainstem';
  if (emotionalWords > logicalStructure && emotionalWords > integrationMarkers) return 'limbic';
  if (logicalStructure > emotionalWords * 1.5) return 'cortical';
  if (integrationMarkers > 0.3) return 'thalamic';
  
  return 'limbic'; // Default to limbic for dreams
}

function countEmotionalWords(text: string): number {
  const emotionalWords = [
    'fear', 'scared', 'afraid', 'terror', 'panic',
    'joy', 'happy', 'elated', 'bliss', 'ecstasy',
    'anger', 'rage', 'fury', 'mad', 'irritated',
    'love', 'affection', 'care', 'tender', 'compassion',
    'sad', 'grief', 'sorrow', 'melancholy', 'despair',
    'anxiety', 'worry', 'stress', 'nervous', 'tense',
    'wonder', 'awe', 'amazement', 'marvel', 'astonish',
    'peace', 'calm', 'serene', 'tranquil', 'still'
  ];
  
  return emotionalWords.filter(word => text.includes(word)).length / emotionalWords.length;
}

function analyzeLogicalStructure(text: string): number {
  const logicalMarkers = [
    'because', 'therefore', 'thus', 'hence', 'consequently',
    'if', 'then', 'when', 'while', 'although',
    'first', 'second', 'third', 'finally', 'next',
    'analyze', 'understand', 'realize', 'conclude', 'deduce'
  ];
  
  return logicalMarkers.filter(marker => text.includes(marker)).length / logicalMarkers.length;
}

function detectPrimalThemes(text: string): number {
  const primalThemes = [
    'survival', 'death', 'birth', 'hunger', 'thirst',
    'chase', 'escape', 'hide', 'hunt', 'predator',
    'sex', 'reproduction', 'mating', 'desire', 'lust',
    'territory', 'dominance', 'submission', 'power', 'control',
    'instinct', 'primitive', 'ancient', 'primal', 'basic'
  ];
  
  return primalThemes.filter(theme => text.includes(theme)).length / primalThemes.length;
}

function detectIntegrationMarkers(text: string): number {
  const integrationWords = [
    'unity', 'oneness', 'connection', 'integration', 'synthesis',
    'balance', 'harmony', 'wholeness', 'complete', 'unified',
    'bridge', 'link', 'merge', 'blend', 'combine',
    'transcend', 'transform', 'evolve', 'grow', 'develop'
  ];
  
  return integrationWords.filter(word => text.includes(word)).length / integrationWords.length;
}

export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  const magnitude1 = Math.sqrt(norm1);
  const magnitude2 = Math.sqrt(norm2);
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
}

export function extractKeySymbols(dreamText: string): string {
  const symbolKeywords = [
    'water', 'ocean', 'river', 'lake', 'rain',
    'fire', 'flame', 'burn', 'light', 'sun',
    'earth', 'ground', 'mountain', 'cave', 'forest',
    'air', 'wind', 'sky', 'cloud', 'storm',
    'spiral', 'circle', 'triangle', 'square', 'pattern',
    'door', 'window', 'bridge', 'path', 'road',
    'mirror', 'reflection', 'shadow', 'image', 'vision',
    'key', 'lock', 'treasure', 'gift', 'secret',
    'animal', 'bird', 'snake', 'wolf', 'eagle',
    'tree', 'flower', 'garden', 'seed', 'root'
  ];
  
  const foundSymbols = symbolKeywords.filter(symbol => 
    dreamText.toLowerCase().includes(symbol)
  );
  
  return foundSymbols.slice(0, 5).join(', ') || 'abstract patterns';
}

export function analyzePatternConnections(
  matches: Array<{sigil: any, similarity: number}>
): string {
  if (matches.length === 0) return 'No pattern connections found';
  
  const brainRegions = matches.map(m => m.sigil.brainRegion);
  const regionCounts = brainRegions.reduce((acc, region) => {
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantRegion = Object.entries(regionCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
  
  const avgSimilarity = matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length;
  
  const timeSpan = calculateTimeSpan(matches);
  
  return `Dominant brain region: ${dominantRegion}\n` +
         `Average resonance strength: ${(avgSimilarity * 100).toFixed(0)}%\n` +
         `Pattern spanning ${timeSpan} days\n` +
         `Neural coherence: ${avgSimilarity > 0.8 ? 'Very High' : avgSimilarity > 0.6 ? 'High' : 'Moderate'}`;
}

function calculateTimeSpan(matches: Array<{sigil: any, similarity: number}>): number {
  if (matches.length === 0) return 0;
  
  const timestamps = matches.map(m => m.sigil.timestamp).filter(t => t);
  if (timestamps.length === 0) return 0;
  
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  
  return Math.ceil((maxTime - minTime) / (1000 * 60 * 60 * 24)); // Days
}

function findMostCommon<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  
  const counts = arr.reduce((acc, item) => {
    acc[String(item)] = (acc[String(item)] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return arr.find(item => counts[String(item)] === Math.max(...Object.values(counts)));
}