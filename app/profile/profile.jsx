import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, allert } from '../../utils/apiConfig';
import { TokenManager } from '../../utils/tokenManager';

export default function ProfileScreen() {
  const router = useRouter();
  
  // State management
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Fetch profile data from API
  const fetchProfile = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Get stored authentication token
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
        setProfileData(data.data.user);
      } else {
        // Handle authentication errors (token expired, invalid, etc.)
        if (response.status === 401 || response.status === 403) {
          // Clear invalid token and redirect to login
          await TokenManager.removeToken();
          throw new Error('Session expired. Please log in again.');
        } else {
          throw new Error(data.message || 'Failed to fetch profile data');
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError(error.message);
      
      // If authentication error, redirect to home
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
        // Other errors - show retry option
        if (allert === 1) {
          Alert.alert(
            'Error',
            'Failed to load profile data. Please try again.',
            [
              {
                text: 'Retry',
                onPress: () => fetchProfile()
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProfile(false);
  };

  // Handle logout
  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        // Clear stored authentication token
        await TokenManager.removeToken();
        console.log('User logged out successfully');
        router.replace('/');
      } catch (error) {
        console.error('Error during logout:', error);
        // Still navigate to home even if token removal fails
        router.replace('/');
      }
    };

    if (allert === 1) {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: performLogout
          }
        ]
      );
    } else {
      await performLogout();
    }
  };

  // Handle edit profile
  const handleEditProfile = () => {
    router.push('/profile/profileEdit');
  };

  // Handle health records navigation
  const handleHealthRecords = () => {
    try {
      router.push('/profile/healthRecords');
    } catch (err) {
      console.warn('Navigation to health records failed:', err);
      // Fallback: do nothing
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        if (allert === 1) {
          Alert.alert(
            'Permission Required',
            'Please allow access to your photo library to upload a profile picture.'
          );
        }
        return;
      }

      // Show action sheet for camera or gallery
      if (allert === 1) {
        Alert.alert(
          'Select Photo',
          'Choose how you want to select your profile photo',
          [
            {
              text: 'Camera',
              onPress: () => openCamera()
            },
            {
              text: 'Gallery',
              onPress: () => openGallery()
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else {
        // Default to gallery if alerts are disabled
        openGallery();
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  // Open camera to take photo
  const openCamera = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.granted === false) {
        if (allert === 1) {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access to take a profile picture.'
          );
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      if (allert === 1) {
        Alert.alert('Error', 'Failed to open camera. Please try again.');
      }
    }
  };

  // Open gallery to select photo
  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      if (allert === 1) {
        Alert.alert('Error', 'Failed to open gallery. Please try again.');
      }
    }
  };

  // Upload photo to server
  const uploadPhoto = async (imageAsset) => {
    setIsUploadingPhoto(true);

    try {
      const token = await TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Prepare base64 image data
      const base64Image = `data:${imageAsset.mimeType || 'image/jpeg'};base64,${imageAsset.base64}`;

      const response = await fetch(`${API_BASE_URL}/api/auth/upload-profile-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image: base64Image
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update profile data with new photo
        setProfileData(prev => ({
          ...prev,
          profile_photo: data.profile_photo || data.data?.profile_photo || data.imageUrl
        }));

        if (allert === 1) {
          Alert.alert('Success', 'Profile photo updated successfully!');
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          await TokenManager.removeToken();
          throw new Error('Session expired. Please log in again.');
        } else {
          throw new Error(data.message || 'Failed to upload profile photo');
        }
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      
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
            'Upload Failed',
            error.message || 'Failed to upload profile photo. Please try again.'
          );
        }
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (_error) {
      return 'N/A';
    }
  };

  // Load profile data on component mount
  // Initial load
  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch profile whenever this screen gains focus (covers navigation back from edit/upload)
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      // no cleanup
      return () => {};
    }, [fetchProfile])
  );

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

  // Error state
  if (error && !profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4A148C" />
        <LinearGradient
          colors={['#4A148C', '#7B1FA2', '#BA68C8', '#E1BEE7']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#fff" />
          <Text style={styles.errorTitle}>Unable to Load Profile</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchProfile()}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
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
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#4A148C']}
            tintColor="#fff"
          />
        }
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity style={styles.avatar} onPress={handlePhotoUpload}>
              {profileData?.profile_photo && profileData.profile_photo !== '' ? (
                <Image
                  source={{ uri: profileData.profile_photo }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={48} color="#4A148C" />
                </View>
              )}
              
              {/* Upload indicator overlay */}
              {isUploadingPhoto && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
              
              {/* Camera icon overlay */}
              <View style={styles.cameraIconOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profileData?.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{profileData?.email || 'user@email.com'}</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil-outline" size={18} color="#4A148C" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Information Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {/* Email Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="mail-outline" size={24} color="#7B1FA2" />
              <Text style={styles.infoCardTitle}>Email Address</Text>
            </View>
            <Text style={styles.infoCardValue}>{profileData?.email || 'N/A'}</Text>
          </View>

          {/* Phone Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="call-outline" size={24} color="#7B1FA2" />
              <Text style={styles.infoCardTitle}>Phone Number</Text>
            </View>
            <Text style={styles.infoCardValue}>{profileData?.phone || 'N/A'}</Text>
          </View>

          {/* Address Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="location-outline" size={24} color="#7B1FA2" />
              <Text style={styles.infoCardTitle}>Address</Text>
            </View>
            <Text style={styles.infoCardValue}>{profileData?.address || 'N/A'}</Text>
          </View>

          {/* Account Info Section */}
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          {/* Member Since Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#7B1FA2" />
              <Text style={styles.infoCardTitle}>Member Since</Text>
            </View>
            <Text style={styles.infoCardValue}>{formatDate(profileData?.createdAt)}</Text>
          </View>

          {/* Last Updated Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="time-outline" size={24} color="#7B1FA2" />
              <Text style={styles.infoCardTitle}>Last Updated</Text>
            </View>
            <Text style={styles.infoCardValue}>{formatDate(profileData?.updatedAt)}</Text>
          </View>

          {/* User ID Card (for support purposes) */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="finger-print-outline" size={24} color="#7B1FA2" />
              <Text style={styles.infoCardTitle}>User ID</Text>
            </View>
            <Text style={styles.infoCardValue}>{profileData?._id || 'N/A'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="settings-outline" size={20} color="#4A148C" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleHealthRecords}>
            <Ionicons name="medical-outline" size={20} color="#4A148C" />
            <Text style={styles.actionButtonText}>Health Records</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.logoutActionButton]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
            <Text style={[styles.actionButtonText, styles.logoutActionButtonText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  logoutButton: {
    padding: 5,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4A148C',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A148C',
  },
  infoSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A148C',
  },
  infoCardValue: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A148C',
  },
  logoutActionButton: {
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.3)',
  },
  logoutActionButtonText: {
    color: '#D32F2F',
  },
});