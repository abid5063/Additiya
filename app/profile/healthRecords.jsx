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
import { TokenManager } from '../../utils/tokenManager';
import { API_BASE_URL, API_BASE_URL_analyze } from '../../utils/apiConfig';

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

// Matrix datasets for receive functionality
const matrixDatasets = [
  [
    [21.1, 20.8, 21.3, 20.5, 21.0, 20.9, 21.2, 20.7],
    [20.9, 21.4, 20.6, 21.1, 20.8, 21.0, 20.7, 21.3],
    [21.2, 20.7, 21.0, 20.9, 21.4, 20.6, 21.1, 20.8],
    [20.8, 21.1, 20.9, 21.3, 20.5, 21.2, 20.7, 21.0],
    [21.0, 20.6, 21.2, 20.8, 21.1, 20.9, 21.4, 20.5],
    [20.7, 21.3, 20.9, 21.0, 20.8, 21.1, 20.6, 21.2],
    [21.1, 20.5, 21.4, 20.7, 21.0, 20.9, 21.3, 20.8],
    [20.9, 21.2, 20.6, 21.1, 20.8, 21.0, 20.7, 21.4],
    [21.3, 20.8, 21.0, 20.9, 21.2, 20.5, 21.1, 20.6],
    [20.6, 21.4, 20.7, 21.3, 20.9, 21.0, 20.8, 21.1],
    [21.0, 20.9, 21.1, 20.6, 21.4, 20.7, 21.3, 20.8],
    [20.8, 21.2, 20.5, 21.0, 20.9, 21.1, 20.6, 21.4],
    [21.4, 20.7, 21.3, 20.8, 21.0, 20.9, 21.2, 20.5],
    [20.9, 21.1, 20.6, 21.4, 20.7, 21.3, 20.8, 21.0],
    [21.2, 20.5, 21.0, 20.9, 21.1, 20.6, 21.4, 20.7]
  ],
  [
    [19.2, 18.7, 20.1, 19.5, 18.9, 19.8, 20.0, 19.4],
    [95.3, 142.7, 23.8, 20.2, 19.6, 18.5, 19.3, 20.1],
    [138.9, 187.4, 156.2, 26.1, 20.0, 19.7, 18.8, 19.2],
    [162.1, 219.8, 245.3, 189.6, 28.7, 19.1, 20.4, 18.6],
    [145.7, 203.2, 267.9, 231.4, 162.8, 25.3, 19.9, 20.2],
    [118.4, 176.5, 238.6, 198.7, 134.2, 89.1, 22.5, 19.5],
    [89.6, 134.8, 189.3, 156.1, 95.7, 67.4, 24.8, 18.9],
    [67.2, 98.4, 142.6, 112.8, 78.3, 45.2, 21.7, 20.3],
    [34.5, 52.1, 76.8, 58.9, 39.6, 26.4, 20.0, 19.8],
    [22.8, 28.3, 35.7, 29.1, 23.5, 21.2, 19.4, 18.7],
    [20.5, 19.9, 21.4, 20.8, 19.6, 18.3, 20.1, 19.0],
    [18.8, 20.2, 19.7, 18.4, 20.0, 19.5, 18.9, 19.6]
  ]
];

export default function HealthRecordsScreen() {
  const router = useRouter();
  const [matrixInput, setMatrixInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [detectionRecords, setDetectionRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [currentMatrixIndex, setCurrentMatrixIndex] = useState(0);

  // Fetch detection records from API
  const fetchDetectionRecords = async () => {
    try {
      const token = await TokenManager.getToken();
      
      if (!token) {
        console.warn('No authentication token found');
        setIsLoadingRecords(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/records?page=1&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDetectionRecords(data.data?.records || data.records || []);
      } else {
        console.error('Failed to fetch detection records:', response.status);
      }
    } catch (error) {
      console.error('Error fetching detection records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Delete a detection record
  const deleteRecord = async (recordId) => {
    try {
      const token = await TokenManager.getToken();
      
      if (!token) {
        console.warn('Authentication required to delete records.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        // Remove the deleted record from state
        setDetectionRecords(prev => prev.filter(record => record._id !== recordId));
      } else {
        console.error('Failed to delete record:', response.status);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };



  // Load default matrix and fetch records on mount
  React.useEffect(() => {
    setMatrixInput(JSON.stringify(defaultMatrix, null, 2));
    fetchDetectionRecords();
  }, []);

  // Save detection result to records API
  const saveDetectionResult = async (analysisData) => {
    try {
      const token = await TokenManager.getToken();
      
      if (!token) {
        console.warn('No authentication token found for saving record');
        return;
      }

      const recordData = {
        lump_detected: analysisData.analysis.lump_detected,
        confidence_percentage: analysisData.analysis.confidence_percentage
      };

      // Only include predicted_size_cm if lump is detected
      if (analysisData.analysis.lump_detected) {
        recordData.predicted_size_cm = analysisData.analysis.predicted_size_cm;
      }

      const response = await fetch(`${API_BASE_URL}/api/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recordData),
      });

      if (response.ok) {
        console.log('Detection result saved to records successfully');
      } else {
        console.error('Failed to save detection result:', response.status);
      }
    } catch (error) {
      console.error('Error saving detection result:', error);
    }
  };

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
        Alert.alert('Invalid Data', 'Data must be a 2D array.');
        return;
      }

      const response = await fetch(`${API_BASE_URL_analyze}/analyze`, {
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

      // Automatically save to records for all analyses (lump detected or not)
      await saveDetectionResult(result);
      // Refresh records to show the new entry
      await fetchDetectionRecords();
      Alert.alert(
        'Analysis Saved', 
        'The analysis result has been automatically saved to your health records.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        error.message || 'Failed to analyze data. Please check your connection and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle receive button - toggle between matrix datasets
  const handleReceive = () => {
    const nextIndex = (currentMatrixIndex + 1) % matrixDatasets.length;
    setCurrentMatrixIndex(nextIndex);
    setMatrixInput(JSON.stringify(matrixDatasets[nextIndex], null, 2));
  };

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
            Enter a stiffness data from pressure sensitive elastography data (8x8 format recommended)
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}> Data (JSON Format):</Text>
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

          <View style={styles.buttonRow}>
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
                {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.receiveButton}
              onPress={handleReceive}
            >
              <Ionicons name="download" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => router.push('/profile/help')}
          >
            <Ionicons name="help-circle" size={20} color="#fff" />
            <Text style={styles.helpButtonText}>Get Help</Text>
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

        {/* Detection Records */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>Previous Detection Records</Text>
          
          {isLoadingRecords ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.loadingText}>Loading records...</Text>
            </View>
          ) : detectionRecords.length > 0 ? (
            detectionRecords.map((record, index) => (
              <View key={record._id || index} style={styles.detectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View style={[styles.statusIndicator, record.lump_detected ? styles.positiveIndicator : styles.negativeIndicator]} />
                    <Text style={styles.cardTitle}>
                      {record.lump_detected ? 'Lump Detected' : 'Normal Reading'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => deleteRecord(record._id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.recordDetails}>
                  <Text style={styles.recordDate}>
                    {new Date(record.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={styles.recordConfidence}>
                    Confidence: {record.confidence_percentage?.toFixed(1)}%
                  </Text>
                  {record.predicted_size_cm && (
                    <Text style={styles.recordSize}>
                      Predicted Size: {record.predicted_size_cm} cm
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyStateText}>No detection records yet</Text>
              <Text style={styles.emptyStateSubtext}>Perform an analysis to create your first record</Text>
            </View>
          )}
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A148C',
    padding: 14,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  receiveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7B1FA2',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  analyzeButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    padding: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  helpButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  
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
  
  // Detection Records Styles
  detectionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A148C',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  positiveIndicator: {
    backgroundColor: '#FF6B6B',
  },
  negativeIndicator: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
  },
  recordDetails: {
    marginTop: 8,
    gap: 4,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  recordConfidence: {
    fontSize: 14,
    color: '#4A148C',
    fontWeight: '600',
  },
  recordSize: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
});
