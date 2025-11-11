import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL, allert } from '../../utils/apiConfig';
import { TokenManager } from '../../utils/tokenManager';

export default function ProfileEditScreen() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = 'Phone number must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Fetch current profile data
  const fetchProfileData = async () => {
    try {
      const token = await TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = data.data.user;
        const profileData = {
          name: userData.name || '',
          email: userData.email || '',
          address: userData.address || '',
          phone: userData.phone || ''
        };
        
        setFormData(profileData);
        setOriginalData(profileData);
      } else {
        if (response.status === 401 || response.status === 403) {
          await TokenManager.removeToken();
          throw new Error('Session expired. Please log in again.');
        } else {
          throw new Error(data.message || 'Failed to fetch profile data');
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      
      if (error.message.includes('Session expired') || error.message.includes('No authentication token')) {
        if (allert === 1) {
          Alert.alert(
            'Authentication Required',
            error.message,
            [
              {
                text: 'Go to Login',
                onPress: () => router.replace('/')
              }
            ]
          );
        } else {
          router.replace('/');
        }
      } else {
        if (allert === 1) {
          Alert.alert(
            'Error',
            'Failed to load profile data. Please try again.',
            [
              {
                text: 'Retry',
                onPress: () => fetchProfileData()
              },
              {
                text: 'Go Back',
                onPress: () => router.back()
              }
            ]
          );
        } else {
          router.back();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const token = await TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Prepare update data (only send fields that have changed)
      const updateData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== originalData[key]) {
          updateData[key] = formData[key].trim();
        }
      });

      // If no changes, just go back
      if (Object.keys(updateData).length === 0) {
        if (allert === 1) {
          Alert.alert('No Changes', 'No changes were made to your profile.', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } else {
          router.back();
        }
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        if (allert === 1) {
          Alert.alert(
            'Success',
            'Profile updated successfully!',
            [
              {
                text: 'OK',
                onPress: () => router.back()
              }
            ]
          );
        } else {
          router.back();
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          await TokenManager.removeToken();
          throw new Error('Session expired. Please log in again.');
        } else {
          throw new Error(data.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.message.includes('Session expired') || error.message.includes('No authentication token')) {
        if (allert === 1) {
          Alert.alert(
            'Authentication Required',
            error.message,
            [
              {
                text: 'Go to Login',
                onPress: () => router.replace('/')
              }
            ]
          );
        } else {
          router.replace('/');
        }
      } else {
        if (allert === 1) {
          Alert.alert(
            'Update Failed',
            error.message || 'Failed to update profile. Please try again.'
          );
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalData) return false;
    return Object.keys(formData).some(key => formData[key] !== originalData[key]);
  };

  // Handle back navigation with unsaved changes warning
  const handleBackPress = () => {
    if (hasUnsavedChanges()) {
      if (allert === 1) {
        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to go back?',
          [
            {
              text: 'Stay',
              style: 'cancel'
            },
            {
              text: 'Discard Changes',
              style: 'destructive',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4A148C" />
        <LinearGradient
          colors={['#4A148C', '#7B1FA2', '#BA68C8', '#E1BEE7']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A148C" />
      
      {/* Purple Gradient Background */}
      <LinearGradient
        colors={['#4A148C', '#7B1FA2', '#BA68C8', '#E1BEE7']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleUpdateProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#8E24AA" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(142, 36, 170, 0.5)"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#8E24AA" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="rgba(142, 36, 170, 0.5)"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#8E24AA" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your phone number"
                  placeholderTextColor="rgba(142, 36, 170, 0.5)"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons name="location-outline" size={20} color="#8E24AA" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Enter your complete address"
                  placeholderTextColor="rgba(142, 36, 170, 0.5)"
                  value={formData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  autoCapitalize="sentences"
                />
              </View>
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.updateButton, isSaving && styles.buttonDisabled]}
              onPress={handleUpdateProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>Update Profile</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBackPress}
              disabled={isSaving}
            >
              <Ionicons name="close-outline" size={20} color="#8E24AA" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  saveButton: {
    padding: 5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 15,
    minHeight: 90,
  },
  inputIcon: {
    marginRight: 12,
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'ios' ? 2 : 0,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A148C',
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
  },
  textArea: {
    paddingTop: Platform.OS === 'ios' ? 8 : 5,
    paddingBottom: Platform.OS === 'ios' ? 8 : 5,
  },
  errorText: {
    fontSize: 14,
    color: '#FFB6C1',
    marginTop: 5,
    fontWeight: '500',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A148C',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
    gap: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E24AA',
  },
});