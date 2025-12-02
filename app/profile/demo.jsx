import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DemoScreen() {
  const router = useRouter();

  const steps = [
    {
      id: 1,
      title: 'Access Health Records',
      description: 'Navigate to your profile and tap on "Health Records" to access the AI analysis tool.',
      icon: 'medical-outline'
    },
    {
      id: 2,
      title: 'Prepare Matrix Data',
      description: 'Input your ultrasound elastography data in 8x8 matrix format. Use the pre-filled sample data to get started.',
      icon: 'grid-outline'
    },
    {
      id: 3,
      title: 'Run Analysis',
      description: 'Tap "Analyze Matrix" to send your data to the AI model for breast tissue analysis.',
      icon: 'analytics-outline'
    },
    {
      id: 4,
      title: 'Review Results',
      description: 'Check the analysis results including confidence level, detection status, and recommendations.',
      icon: 'checkmark-circle-outline'
    },
    {
      id: 5,
      title: 'Track History',
      description: 'All analysis results are automatically saved to your health records for tracking over time.',
      icon: 'time-outline'
    },
    {
      id: 6,
      title: 'Consult Healthcare Provider',
      description: 'Share results with your healthcare provider for professional medical interpretation.',
      icon: 'people-outline'
    }
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How to Use ADDITIYA</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="medical" size={48} color="#fff" />
          </View>
          <Text style={styles.introTitle}>AI-Powered Breast Cancer Detection</Text>
          <Text style={styles.introDescription}>
            Follow these simple steps to use ADDITIYA&apos;s advanced AI technology for breast tissue analysis.
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsSection}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.id}</Text>
                </View>
                <View style={styles.stepIconContainer}>
                  <Ionicons name={step.icon} size={24} color="#4A148C" />
                </View>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.id === 2 ? (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={require('../../assets/images/demo.png')} 
                      style={styles.demoImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.imageCaption}>
                      Example of matrix data format for analysis
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.stepDescription}>{step.description}</Text>
                )}
              </View>
              {index < steps.length - 1 && <View style={styles.stepConnector} />}
            </View>
          ))}
        </View>

        {/* Important Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Important Notes</Text>
          <View style={styles.noteCard}>
            <Ionicons name="warning-outline" size={20} color="#FF8C00" />
            <Text style={styles.noteText}>
              This tool is for screening purposes only and should not replace professional medical diagnosis.
            </Text>
          </View>
          <View style={styles.noteCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
            <Text style={styles.noteText}>
              All data is processed securely and your privacy is protected.
            </Text>
          </View>
          <View style={styles.noteCard}>
            <Ionicons name="time-outline" size={20} color="#2196F3" />
            <Text style={styles.noteText}>
              Regular screening and consultation with healthcare providers is recommended.
            </Text>
          </View>
        </View>

        {/* Call to Action */}
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={() => router.push('/profile/healthRecords')}
        >
          <Ionicons name="medical-outline" size={20} color="#fff" />
          <Text style={styles.ctaButtonText}>Start Analysis</Text>
        </TouchableOpacity>
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
  
  // Introduction Section
  introSection: { alignItems: 'center', marginBottom: 32 },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  introDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Steps Section
  stepsSection: { marginBottom: 32 },
  stepCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#4A148C',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(74, 20, 140, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A148C',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  demoImage: {
    width: '100%',
    height: 500,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageCaption: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  stepConnector: {
    position: 'absolute',
    bottom: -8,
    left: 35,
    width: 2,
    height: 8,
    backgroundColor: '#4A148C',
  },
  
  // Notes Section
  notesSection: { marginBottom: 24 },
  notesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  
  // Call to Action
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A148C',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});