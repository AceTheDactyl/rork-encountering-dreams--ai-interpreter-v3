export interface Dream {
  id: string;
  name: string;
  text: string;
  description?: string;
  persona: 'orion' | 'limnus';
  interpretation: string;
  dreamType: string;
  date: string;
  blockchainValidated?: boolean;
  alignedBlocks?: string[];
  neuralSigilId?: string;
  consciousnessDepth?: number;
  brainRegionActivation?: string;
  similarDreams?: string[];
}

export interface Persona {
  id: 'orion' | 'limnus';
  name: string;
  description: string;
  color: string;
  systemPrompt: string;
}