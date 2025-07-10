import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react-native';
import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import Colors from '@/constants/colors';

interface Props {
  sigil: NeuralSigil;
  showComparison?: boolean;
  comparisonSigil?: NeuralSigil;
}

export const NeuralSigilVisualization: React.FC<Props> = ({ 
  sigil, 
  showComparison = false,
  comparisonSigil 
}) => {
  const [expanded, setExpanded] = useState(false);
  const vector = expanded ? sigil.pattern : sigil.pattern.slice(0, 8);

  const brainRegionColor = useMemo(() => {
    const colors: Record<NeuralSigil['brainRegion'], string> = {
      Cortical: '#3498db',
      Limbic: '#e74c3c',
      Brainstem: '#2ecc71',
      Thalamic: '#f1c40f'
    };
    return colors[sigil.brainRegion];
  }, [sigil.brainRegion]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Brain size={20} color={brainRegionColor} />
        <Text style={[styles.headerText, { color: brainRegionColor }]}>
          {sigil.brainRegion} Sigil
        </Text>
        <Text style={styles.strengthText}>
          Strength: {(sigil.strength * 100).toFixed(0)}%
        </Text>
      </View>
      
      <View style={styles.vectorGrid}>
        {vector.map((v, i) => (
          <View key={i} style={styles.cell}>
            <Text style={styles.cellText}>{v.toFixed(3)}</Text>
          </View>
        ))}
        {!expanded && (
          <View style={styles.cell}>
            <Text style={styles.cellText}>...</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.expand} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.expandText}>
          {expanded ? 'Show Less' : `Show All ${sigil.pattern.length} Dimensions`}
        </Text>
        {expanded ? (
          <ChevronUp size={14} color={Colors.dark.primary} />
        ) : (
          <ChevronDown size={14} color={Colors.dark.primary} />
        )}
      </TouchableOpacity>
      
      {sigil.metadata && Object.keys(sigil.metadata).length > 0 && (
        <View style={styles.metadata}>
          <Text style={styles.metadataTitle}>Metadata</Text>
          {Object.entries(sigil.metadata).map(([key, value]) => (
            <Text key={key} style={styles.metadataItem}>
              {key}: {String(value)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  strengthText: {
    fontSize: 12,
    color: Colors.dark.text,
    marginLeft: 'auto',
    opacity: 0.7,
  },
  vectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  cell: {
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    margin: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  cellText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  expand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  expandText: {
    color: Colors.dark.primary,
    fontSize: 12,
    marginRight: 4,
  },
  metadata: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  metadataItem: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginVertical: 2,
  },
});