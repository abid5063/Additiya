import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Default matrix for demonstration
const defaultMatrix = [
    [1.2, 1.1, 1.0, 1.1, 1.2, 1.0, 1.1, 1.0],
    [1.1, 1.3, 1.2, 1.1, 1.0, 1.2, 1.1, 1.0],
    [1.0, 1.2, 2.5, 2.8, 2.6, 1.1, 1.0, 1.1],
    [1.1, 1.1, 2.7, 3.2, 2.9, 1.2, 1.1, 1.0],
    [1.2, 1.0, 2.4, 2.9, 2.7, 1.0, 1.1, 1.2],
    [1.0, 1.2, 1.1, 1.2, 1.1, 1.3, 1.0, 1.1],
    [1.1, 1.0, 1.2, 1.0, 1.1, 1.0, 1.2, 1.0],
  [1.0, 1.1, 1.0, 1.1, 1.0, 1.1, 1.0, 1.2]
];

export default function HealthRecordsScreen() {
  const router = useRouter();
  const [matrixInput, setMatrixInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Load default matrix on mount
  React.useEffect(() => {
    setMatrixInput(JSON.stringify(defaultMatrix, null, 2));
  }, []);

  // Handle matrix analysis
  const analyzeMatrix = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisResult(null);

      // Parse matrix input
      let matrix;
      try {
        matrix = JSON.parse(matrixInput);
      } catch (_parseError) {
        Alert.alert('Invalid Input', 'Please enter a valid JSON matrix format.');
        return;
      }

      // Validate matrix format
      if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
        Alert.alert('Invalid Matrix', 'Matrix must be a 2D array.');
        return;
      }

      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matrix }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        error.message || 'Failed to analyze matrix. Please check your connection and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dummyRecords = [
    {
      id: '1',
      date: '2025-10-12',
      type: 'Mammogram',
      result: 'Normal',
      notes: 'No suspicious findings. Follow-up in 1 year.',
    },
    {
      id: '2',
      date: '2024-09-05',
      type: 'Clinical Breast Exam',
      result: 'Normal',
      notes: 'Routine check, no lumps detected.',
    },
    {
      id: '3',
      date: '2023-08-20',
      type: 'Ultrasound',
      result: 'Benign cyst',
      notes: 'Benign cyst monitored; no intervention required.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A148C" />

      <LinearGradient
        colors={['#4A148C', '#7B1FA2', '#BA68C8']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Records</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>AI-Powered Breast Cancer Analysis & Health Records</Text>

        {/* Analysis Form */}
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>Breast Tissue Analysis</Text>
          <Text style={styles.sectionDescription}>
            Enter a stiffness matrix from ultrasound elastography data (8x8 format recommended)
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Matrix Data (JSON Format):</Text>
            <TextInput
              style={styles.matrixInput}
              value={matrixInput}
              onChangeText={setMatrixInput}
              multiline
              numberOfLines={10}
              placeholder="Enter matrix data in JSON format..."
              placeholderTextColor="rgba(74, 20, 140, 0.5)"
            />
          </View>

          <TouchableOpacity 
            style={[styles.analyzeButton, isAnalyzing && styles.buttonDisabled]}
            onPress={analyzeMatrix}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="analytics" size={20} color="#fff" />
            )}
            <Text style={styles.analyzeButtonText}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Matrix'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Analysis Results */}
        {analysisResult && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Analysis Results</Text>
            
            <View style={[styles.resultCard, analysisResult.analysis?.lump_detected ? styles.alertCard : styles.normalCard]}>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={analysisResult.analysis?.lump_detected ? "warning" : "checkmark-circle"} 
                  size={24} 
                  color={analysisResult.analysis?.lump_detected ? "#FF6B6B" : "#4CAF50"} 
                />
                <Text style={styles.resultTitle}>
                  {analysisResult.analysis?.lump_detected ? 'Suspicious Area Detected' : 'Normal Reading'}
                </Text>
              </View>
              
              <View style={styles.resultDetails}>
                <Text style={styles.resultItem}>Confidence: {analysisResult.analysis?.confidence_percentage?.toFixed(1) || (analysisResult.analysis?.confidence * 100)?.toFixed(1)}%</Text>
                {analysisResult.analysis?.predicted_size_cm && (
                  <Text style={styles.resultItem}>Estimated Size: {analysisResult.analysis.predicted_size_cm} cm</Text>
                )}
                {analysisResult.analysis?.matrix_shape && (
                  <Text style={styles.resultItem}>Matrix Size: {analysisResult.analysis.matrix_shape.join(' × ')}</Text>
                )}
                {analysisResult.analysis?.interpretation && (
                  <Text style={styles.resultItem}>Status: {analysisResult.analysis.interpretation}</Text>
                )}
              </View>
              
              {(analysisResult.analysis?.suspicious_regions || analysisResult.analysis?.matrix_statistics) && (
                <View style={styles.analysisDetails}>
                  <Text style={styles.analysisLabel}>Findings:</Text>
                  {analysisResult.analysis.suspicious_regions ? (
                    <Text style={styles.analysisText}>{analysisResult.analysis.suspicious_regions}</Text>
                  ) : (
                    <Text style={styles.analysisText}>
                      Matrix Analysis: Mean value {analysisResult.analysis.matrix_statistics?.mean_value?.toFixed(2)}, 
                      Max value {analysisResult.analysis.matrix_statistics?.max_value?.toFixed(2)}, 
                      Std deviation {analysisResult.analysis.matrix_statistics?.std_value?.toFixed(2)}
                    </Text>
                  )}
                </View>
              )}
              
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationLabel}>Recommendation:</Text>
                <Text style={styles.recommendationText}>
                  {analysisResult.analysis?.recommendation || 
                   (analysisResult.analysis?.lump_detected 
                     ? 'Consult with healthcare provider for further examination and imaging studies.'
                     : 'Continue regular screening as recommended by healthcare provider.')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Historical Records */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>Historical Records</Text>
          
          {dummyRecords.map(record => (
          <View key={record.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{record.type}</Text>
              <Text style={styles.cardDate}>{new Date(record.date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.cardResult}>Result: {record.result}</Text>
            <Text style={styles.cardNotes}>{record.notes}</Text>
          </View>
        ))}
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Disclaimer</Text>
          <Text style={styles.noteText}>These are dummy records for UI/demo purposes only and do not represent real medical data.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', flex: 1 },
  headerRight: { width: 32 },
  content: { padding: 20, paddingBottom: 40 },
  intro: { color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#4A148C' },
  cardDate: { fontSize: 14, color: '#666' },
  cardResult: { fontSize: 15, marginBottom: 6 },
  cardNotes: { fontSize: 14, color: '#444' },
  noteBox: { marginTop: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10 },
  noteTitle: { fontWeight: '700', marginBottom: 6, color: '#4A148C' },
  noteText: { color: '#333' },
  
  // Analysis Form Styles
  analysisSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  sectionDescription: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16, lineHeight: 20 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8 },
  matrixInput: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#4A148C',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A148C',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  analyzeButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  
  // Results Styles
  resultsSection: { marginBottom: 24 },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  alertCard: { borderColor: '#FF6B6B' },
  normalCard: { borderColor: '#4CAF50' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  resultTitle: { fontSize: 16, fontWeight: '700', color: '#4A148C' },
  resultDetails: { marginBottom: 12 },
  resultItem: { fontSize: 14, color: '#666', marginBottom: 4 },
  analysisDetails: { marginBottom: 12 },
  analysisLabel: { fontSize: 14, fontWeight: '600', color: '#4A148C', marginBottom: 4 },
  analysisText: { fontSize: 14, color: '#444' },
  recommendationBox: {
    backgroundColor: 'rgba(74, 20, 140, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  recommendationLabel: { fontSize: 14, fontWeight: '600', color: '#4A148C', marginBottom: 4 },
  recommendationText: { fontSize: 14, color: '#4A148C' },
  
  // Records Section
  recordsSection: { marginBottom: 16 },
});
