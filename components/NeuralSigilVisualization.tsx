import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Brain, ChevronDown, ChevronUp, Zap, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

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
  const [pulseAnimation] = useState(new Animated.Value(0));
  const vector = expanded ? sigil.pattern : sigil.pattern.slice(0, 12);

  const brainRegionColor = useMemo(() => {
    const colors: Record<NeuralSigil['brainRegion'], string> = {
      Cortical: Colors.dark.secondary,
      Limbic: Colors.dark.error,
      Brainstem: Colors.dark.success,
      Thalamic: Colors.dark.accent
    };
    return colors[sigil.brainRegion];
  }, [sigil.brainRegion]);
  
  const sourceTypeIcon = useMemo(() => {
    const icons = {
      dream: Brain,
      meditation: Activity,
      breath: Zap,
      composite: Brain
    };
    return icons[sigil.sourceType] || Brain;
  }, [sigil.sourceType]);
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[brainRegionColor + '15', brainRegionColor + '05', 'transparent']}
        style={styles.gradientBackground}
      >
        <Animated.View 
          style={[
            styles.pulseOverlay,
            {
              opacity: pulseAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
            },
          ]}
        />
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {React.createElement(sourceTypeIcon, { size: 20, color: brainRegionColor })}
            <View style={styles.headerInfo}>
              <Text style={[styles.headerText, { color: brainRegionColor }]}>
                {sigil.brainRegion}
              </Text>
              <Text style={styles.sourceTypeText}>
                {sigil.sourceType.charAt(0).toUpperCase() + sigil.sourceType.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.strengthBadge}>
            <Text style={styles.strengthText}>
              {(sigil.strength * 100).toFixed(0)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.vectorGrid}>
          {vector.map((v, i) => {
            const intensity = Math.abs(v);
            const isPositive = v > 0;
            return (
              <View 
                key={i} 
                style={[
                  styles.cell,
                  {
                    backgroundColor: isPositive 
                      ? brainRegionColor + Math.floor(intensity * 255).toString(16).padStart(2, '0')
                      : Colors.dark.border + Math.floor(intensity * 128).toString(16).padStart(2, '0')
                  }
                ]}
              >
                <Text style={[
                  styles.cellText,
                  { color: intensity > 0.5 ? Colors.dark.background : Colors.dark.text }
                ]}>
                  {v.toFixed(2)}
                </Text>
              </View>
            );
          })}
          {!expanded && (
            <TouchableOpacity 
              style={[styles.cell, styles.expandCell]} 
              onPress={() => setExpanded(true)}
            >
              <Text style={styles.cellText}>+{sigil.pattern.length - vector.length}</Text>
            </TouchableOpacity>
          )}
        </View>
      
      <TouchableOpacity 
        style={styles.expand} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.expandText}>
          {expanded ? 'Show Less' : `Show All ${sigil.pattern.length} Dimensions`}
        </Text>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </TouchableOpacity>
      
      {sigil.metadata && Object.keys(sigil.metadata).length > 0 && (
        <View style={styles.metadata}>
          <Text style={styles.metadataTitle}>Metadata</Text>
          {Object.entries(sigil.metadata).map(([key, value]) => (
            <Text key={key} style={styles.metadataItem}>
              {key}: {value}
            </Text>
          ))}
        </View>
      )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBackground: {
    padding: 16,
    position: 'relative',
  },
  pulseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.dark.primary,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerInfo: {
    gap: 2,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
  },
  sourceTypeText: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  strengthBadge: {
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  strengthText: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  vectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    zIndex: 1,
  },
  cell: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: (width - 80) / 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border + '40',
  },
  expandCell: {
    backgroundColor: Colors.dark.primary + '20',
    borderColor: Colors.dark.primary + '40',
  },
  cellText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  expand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    zIndex: 1,
  },
  expandText: {
    color: Colors.dark.primary,
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  metadata: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    zIndex: 1,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  metadataItem: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginVertical: 3,
    lineHeight: 16,
  },
});