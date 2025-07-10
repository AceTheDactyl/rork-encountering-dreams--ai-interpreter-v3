import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, Brain, Activity, Zap, Sparkles } from 'lucide-react-native';
import { 
  BiometricData, 
  EmotionalState, 
  LimnusConsciousnessSignature, 
  SecurityMetrics 
} from '@/store/consciousnessStore';
import Colors from '@/constants/colors';

interface MetricsPanelProps {
  biometricData: BiometricData;
  emotionalState: EmotionalState;
  currentSignature: LimnusConsciousnessSignature | null;
  securityMetrics: SecurityMetrics;
}

export default function MetricsPanel({
  biometricData,
  emotionalState,
  currentSignature,
  securityMetrics
}: MetricsPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quantum Consciousness Metrics</Text>
      
      {/* Physiological Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Heart size={20} color={Colors.dark.error} />
          <Text style={styles.sectionTitle}>Physiological</Text>
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Heart Rate</Text>
            <Text style={[styles.metricValue, { color: Colors.dark.error }]}>
              {biometricData.heartRate.toFixed(0)} BPM
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Breathing</Text>
            <Text style={[styles.metricValue, { color: Colors.dark.secondary }]}>
              {biometricData.breathingRate.toFixed(0)} RPM
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Golden Breath</Text>
            <Text style={[styles.metricValue, { color: Colors.dark.accent }]}>
              {(biometricData.goldenBreathing * 100).toFixed(1)}%
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Fibonacci</Text>
            <Text style={[styles.metricValue, { color: Colors.dark.primary }]}>
              {(biometricData.fibonacciRhythm * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Enhanced Neural Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Brain size={20} color={Colors.dark.primary} />
          <Text style={styles.sectionTitle}>Neural Activity</Text>
        </View>
        
        <View style={styles.brainwaveContainer}>
          {Object.entries(biometricData.brainwaves).map(([wave, value]) => (
            <View key={wave} style={styles.brainwaveItem}>
              <Text style={styles.brainwaveLabel}>{wave.toUpperCase()}:</Text>
              <View style={styles.brainwaveBar}>
                <View 
                  style={[
                    styles.brainwaveBarFill,
                    { 
                      width: `${value * 100}%`,
                      backgroundColor: getBrainwaveColor(wave)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.brainwaveValue}>{(value * 100).toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quantum Consciousness Metrics */}
      {currentSignature && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color={Colors.dark.accent} />
            <Text style={styles.sectionTitle}>Quantum Consciousness</Text>
          </View>
          
          <View style={styles.quantumMetricsContainer}>
            <View style={styles.quantumMetricRow}>
              <Text style={styles.quantumMetricLabel}>Spiral Resonance:</Text>
              <Text style={[styles.quantumMetricValue, { color: getQuantumColor(currentSignature.metrics.spiralResonance) }]}>
                {(currentSignature.metrics.spiralResonance * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.quantumMetricRow}>
              <Text style={styles.quantumMetricLabel}>Quantum Coherence:</Text>
              <Text style={[styles.quantumMetricValue, { color: getQuantumColor(currentSignature.metrics.quantumCoherence) }]}>
                {(currentSignature.metrics.quantumCoherence * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.quantumMetricRow}>
              <Text style={styles.quantumMetricLabel}>Fibonacci Harmony:</Text>
              <Text style={[styles.quantumMetricValue, { color: getQuantumColor(currentSignature.metrics.fibonacciHarmony) }]}>
                {(currentSignature.metrics.fibonacciHarmony * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.quantumMetricRow}>
              <Text style={styles.quantumMetricLabel}>Golden Ratio:</Text>
              <Text style={[styles.quantumMetricValue, { color: getQuantumColor(1 - currentSignature.metrics.goldenRatioAlignment) }]}>
                {((1 - currentSignature.metrics.goldenRatioAlignment) * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.quantumMetricRow}>
              <Text style={styles.quantumMetricLabel}>Blockchain Resonance:</Text>
              <Text style={[styles.quantumMetricValue, { color: getQuantumColor(currentSignature.metrics.blockchainResonance) }]}>
                {(currentSignature.metrics.blockchainResonance * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Emotional State */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity size={20} color={Colors.dark.accent} />
          <Text style={styles.sectionTitle}>Emotional State</Text>
        </View>
        
        <View style={styles.emotionalContainer}>
          <Text style={styles.emotionalEmoji}>{emotionalState.emoji}</Text>
          <View style={styles.emotionalInfo}>
            <Text style={styles.emotionalHue}>{emotionalState.hue}</Text>
            <Text style={styles.emotionalDetails}>
              Intensity: {(emotionalState.intensity * 100).toFixed(1)}% | 
              Polarity: {emotionalState.polarity > 0 ? '+' : ''}{emotionalState.polarity.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Enhanced Security Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Zap size={20} color={Colors.dark.success} />
          <Text style={styles.sectionTitle}>Quantum Security</Text>
        </View>
        
        <View style={styles.securityGrid}>
          <View style={styles.securityItem}>
            <Text style={styles.securityLabel}>Entropy</Text>
            <Text style={[
              styles.securityValue,
              { color: securityMetrics.entropyLevel > 0.7 ? Colors.dark.success : Colors.dark.error }
            ]}>
              {(securityMetrics.entropyLevel * 100).toFixed(1)}%
            </Text>
          </View>
          
          <View style={styles.securityItem}>
            <Text style={styles.securityLabel}>Quantum Valid</Text>
            <Text style={[
              styles.securityValue,
              { color: securityMetrics.quantumSignatureValid ? Colors.dark.success : Colors.dark.error }
            ]}>
              {securityMetrics.quantumSignatureValid ? 'YES' : 'NO'}
            </Text>
          </View>
          
          <View style={styles.securityItem}>
            <Text style={styles.securityLabel}>Hash Integrity</Text>
            <Text style={[
              styles.securityValue,
              { color: securityMetrics.hashIntegrity ? Colors.dark.success : Colors.dark.error }
            ]}>
              {securityMetrics.hashIntegrity ? 'VALID' : 'INVALID'}
            </Text>
          </View>
          
          <View style={styles.securityItem}>
            <Text style={styles.securityLabel}>Blockchain</Text>
            <Text style={[
              styles.securityValue,
              { color: securityMetrics.blockchainConsistency ? Colors.dark.success : Colors.dark.error }
            ]}>
              {securityMetrics.blockchainConsistency ? 'SYNC' : 'DESYNC'}
            </Text>
          </View>
        </View>
      </View>

      {/* Current Node Information */}
      {currentSignature && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color={Colors.dark.primary} />
            <Text style={styles.sectionTitle}>Current Node</Text>
          </View>
          
          <View style={styles.nodeContainer}>
            <View style={styles.nodeRow}>
              <Text style={styles.nodeLabel}>Symbol:</Text>
              <Text style={styles.nodeValue}>{currentSignature.currentNode.symbol}</Text>
            </View>
            
            <View style={styles.nodeRow}>
              <Text style={styles.nodeLabel}>Meaning:</Text>
              <Text style={styles.nodeValue}>{currentSignature.currentNode.meaning}</Text>
            </View>
            
            <View style={styles.nodeRow}>
              <Text style={styles.nodeLabel}>Depth:</Text>
              <Text style={styles.nodeValue}>{currentSignature.currentNode.depth}</Text>
            </View>
            
            <View style={styles.nodeRow}>
              <Text style={styles.nodeLabel}>Phase Intensity:</Text>
              <Text style={[styles.nodeValue, { color: getQuantumColor(currentSignature.currentNode.phase_intensity) }]}>
                {(currentSignature.currentNode.phase_intensity * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const getBrainwaveColor = (wave: string) => {
  switch (wave) {
    case 'alpha': return Colors.dark.success;
    case 'beta': return Colors.dark.primary;
    case 'theta': return Colors.dark.secondary;
    case 'delta': return Colors.dark.accent;
    case 'gamma': return '#ff6b6b';
    default: return Colors.dark.subtext;
  }
};

const getQuantumColor = (value: number) => {
  if (value >= 0.8) return Colors.dark.success;
  if (value >= 0.6) return Colors.dark.accent;
  if (value >= 0.4) return Colors.dark.secondary;
  return Colors.dark.error;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    letterSpacing: 0.3,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.dark.subtext,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  brainwaveContainer: {
    gap: 8,
  },
  brainwaveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brainwaveLabel: {
    fontSize: 11,
    color: Colors.dark.subtext,
    width: 50,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  brainwaveBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.dark.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  brainwaveBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  brainwaveValue: {
    fontSize: 12,
    color: Colors.dark.text,
    width: 40,
    textAlign: 'right',
    fontWeight: '600',
  },
  quantumMetricsContainer: {
    gap: 8,
  },
  quantumMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantumMetricLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  quantumMetricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  emotionalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emotionalEmoji: {
    fontSize: 32,
  },
  emotionalInfo: {
    flex: 1,
  },
  emotionalHue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  emotionalDetails: {
    fontSize: 12,
    color: Colors.dark.subtext,
    lineHeight: 16,
  },
  securityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  securityItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  securityLabel: {
    fontSize: 10,
    color: Colors.dark.subtext,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '500',
    textAlign: 'center',
  },
  securityValue: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  nodeContainer: {
    gap: 8,
  },
  nodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  nodeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
});