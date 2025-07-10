import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Zap, Activity, Circle } from 'lucide-react-native';
import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import Colors from '@/constants/colors';

interface Props {
  sigil: NeuralSigil;
  onPress?: () => void;
  showMetadata?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Complete brain region color mapping
const BRAIN_REGION_COLORS: Record<NeuralSigil['brainRegion'], string> = {
  Cortical: '#3b82f6',
  Limbic: '#ef4444', 
  Brainstem: '#22c55e',
  Thalamic: '#a855f7',
  BasalGanglia: '#f59e0b',
  Cerebellar: '#06b6d4',
  Integration: '#ec4899'
};

const BRAIN_REGION_ICONS = {
  Cortical: Brain,
  Limbic: Activity,
  Brainstem: Circle,
  Thalamic: Zap,
  BasalGanglia: Activity,
  Cerebellar: Brain,
  Integration: Zap
};

export default function NeuralSigilVisualization({ 
  sigil, 
  onPress, 
  showMetadata = true,
  size = 'medium' 
}: Props) {
  const patternGrid = useMemo(() => {
    if (!sigil.pattern) return [];
    
    // Convert Float32Array to regular array for processing
    const patternArray = Array.from(sigil.pattern);
    
    // Create 8x8 grid from 64-element pattern
    const grid: number[][] = [];
    for (let i = 0; i < 8; i++) {
      const row: number[] = [];
      for (let j = 0; j < 8; j++) {
        const index = i * 8 + j;
        row.push(patternArray[index] || 0);
      }
      grid.push(row);
    }
    return grid;
  }, [sigil.pattern]);

  const regionColor = BRAIN_REGION_COLORS[sigil.brainRegion];
  const RegionIcon = BRAIN_REGION_ICONS[sigil.brainRegion];
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { container: 120, cell: 12, text: 12 };
      case 'large':
        return { container: 200, cell: 20, text: 16 };
      default:
        return { container: 160, cell: 16, text: 14 };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderPatternGrid = () => (
    <View style={[styles.patternGrid, { width: sizeStyles.container, height: sizeStyles.container }]}>
      {patternGrid.map((row, i) => (
        <View key={i} style={styles.patternRow}>
          {row.map((value, j) => (
            <View
              key={j}
              style={[
                styles.patternCell,
                {
                  width: sizeStyles.cell,
                  height: sizeStyles.cell,
                  backgroundColor: `${regionColor}${Math.floor(value * 255).toString(16).padStart(2, '0')}`,
                }
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
    >
      <LinearGradient
        colors={[Colors.dark.card, Colors.dark.background]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <RegionIcon size={20} color={regionColor} />
          <Text style={[styles.title, { fontSize: sizeStyles.text }]}>
            {sigil.brainRegion}
          </Text>
          <View style={[styles.strengthIndicator, { backgroundColor: regionColor }]}>
            <Text style={styles.strengthText}>
              {Math.round(sigil.strength * 100)}%
            </Text>
          </View>
        </View>

        {renderPatternGrid()}

        {showMetadata && sigil.metadata?.neuralSigilData && (
          <View style={styles.metadata}>
            <Text style={styles.metadataTitle}>
              {sigil.metadata.neuralSigilData.name}
            </Text>
            <Text style={styles.metadataText}>
              {sigil.metadata.neuralSigilData.phrase}
            </Text>
            <Text style={styles.metadataSubtext}>
              {sigil.metadata.neuralSigilData.breathPhase} • {sigil.sourceType}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {new Date(sigil.timestamp).toLocaleTimeString()}
          </Text>
          <Text style={styles.sourceType}>
            {sigil.sourceType}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    color: Colors.dark.text,
    fontWeight: '600',
    flex: 1,
  },
  strengthIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  strengthText: {
    color: Colors.dark.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  patternGrid: {
    alignSelf: 'center',
    marginVertical: 12,
  },
  patternRow: {
    flexDirection: 'row',
  },
  patternCell: {
    margin: 0.5,
    borderRadius: 1,
  },
  metadata: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  metadataTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  metadataText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginBottom: 4,
  },
  metadataSubtext: {
    color: Colors.dark.subtext,
    fontSize: 10,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    color: Colors.dark.subtext,
    fontSize: 10,
  },
  sourceType: {
    color: Colors.dark.subtext,
    fontSize: 10,
    textTransform: 'capitalize',
  },
});