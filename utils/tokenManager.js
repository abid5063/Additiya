import AsyncStorage from '@react-native-async-storage/async-storage';

// Token management utility functions
const TOKEN_KEY = 'user_auth_token';
const USER_DATA_KEY = 'user_profile_data';

export class TokenManager {
  // Store authentication token
  static async storeToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('Token stored successfully');
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  }

  // Retrieve authentication token
  static async getToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  // Remove authentication token (logout)
  static async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('Token removed successfully');
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token !== null;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Store user profile data
  static async storeUserData(userData) {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  // Retrieve user profile data
  static async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  // Remove user profile data
  static async removeUserData() {
    try {
      await AsyncStorage.removeItem(USER_DATA_KEY);
      console.log('User data removed successfully');
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  }

  // Clear all stored data (for complete logout)
  static async clearAllData() {
    try {
      await AsyncStorage.clear();
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}