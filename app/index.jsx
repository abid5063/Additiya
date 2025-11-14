import { StyleSheet, Image, TouchableOpacity, Text, View, SafeAreaView, StatusBar, Linking } from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen() {
  const router = useRouter();
  const { language, changeLanguage, isLoading: languageLoading } = useLanguage();
  const { t, i18n } = useTranslation();

  // Update i18n language when language changes
  useEffect(() => {
    if (!languageLoading) {
      try {
        i18n.changeLanguage(language);
      } catch (error) {
        console.log('Error changing language:', error);
      }
    }
  }, [language, i18n, languageLoading]);

  const handleSignIn = () => {
    router.push('/auth/signIn');
  };

  const handleSignUp = () => {
    router.push('/auth/signUp');
  };

  const handleLearnMore = () => {
    try {
      // Replace with actual ADDITIYA tutorial or educational content about breast cancer detection
      Linking.openURL('https://www.who.int/news-room/fact-sheets/detail/breast-cancer');
    } catch (error) {
      console.log('Error opening educational link:', error);
    }
  };

  // Show loading state while language is initializing
  if (languageLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#663399" />
        <LinearGradient
          colors={['#4A148C', '#7B1FA2', '#BA68C8', '#E1BEE7']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}> 
      <StatusBar barStyle="light-content" backgroundColor="#663399" />
      
      {/* Purple Gradient Background */}
      <LinearGradient
        colors={['#4A148C', '#7B1FA2', '#BA68C8', '#E1BEE7']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Language Toggle Button */}
      <TouchableOpacity
        style={styles.langButton}
        onPress={() => {
          try {
            changeLanguage(language === 'en' ? 'bn' : 'en');
          } catch (error) {
            console.log('Error changing language:', error);
          }
        }}
      >
        <Text style={styles.langButtonText}>{language === 'en' ? 'BN' : 'EN'}</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        {/* ADDITIYA Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.jpg')}
              style={styles.logo}
              resizeMode="cover"
            />
            {/* Logo purple blend overlay */}
            <LinearGradient
              colors={['rgba(225, 190, 231, 0.97)', 'rgba(123, 31, 162, 0.61)', 'rgba(156, 39, 176, 0.1)', 'transparent']}
              style={styles.logoBlendOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {/* Additional purple blend layers for seamless integration */}
            <View style={styles.logoBlendLayer1} />
            <View style={styles.logoBlendLayer2} />
          </View>
        </View>

        {/* App Title and Tagline Section */}
        <View style={styles.taglineSection}>
          {/* <Text style={styles.appTitle}>ADDITIYA</Text> */}
          <Text style={styles.appSubtitle}>AI-Powered Early Detection</Text>
          <Text style={styles.tagline}>{t('tagline') || 'Detect early. Live fully.'}</Text>
          <Text style={styles.subTagline}>{t('subTagline1') || 'Revolutionary breast cancer screening from home'}</Text>
          <TouchableOpacity 
            style={styles.learnMoreButton}
            onPress={handleLearnMore}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-youtube" size={20} color="#663399" />
            <Text style={styles.learnMoreText}>{t('subTagline2') || 'Learn about early detection'}</Text>
          </TouchableOpacity>
        </View>

        {/* Button Section - Sign In and Sign Up */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleSignIn}
            testID="sign-in-button"
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={28} color='#4A148C' />
            <Text style={styles.buttonText}>{t('signIn') || 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleSignUp}
            testID="sign-up-button"
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={28} color='#4A148C'/>
            <Text style={styles.buttonText}>{t('signUp') || 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent','rgba(225, 190, 231, 1)',  'rgba(186, 104, 200, 1)']}
        style={styles.bottomOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  logoSection: {
    flex: 1, //don't change
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 2,
  },
  logoContainer: {
    width: '120%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    opacity: 0.98,
    borderRadius: 8,
  },
  logoBlendOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    borderRadius: 10,
  },
  logoBlendLayer1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    backgroundColor: 'rgba(74, 20, 140, 0.1)',
    borderRadius: 15,
  },
  logoBlendLayer2: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    backgroundColor: 'rgba(106, 27, 154, 0.05)',
    borderRadius: 10,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4A148C',
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6A1B9A',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  taglineSection: {
    alignItems: 'center',
    paddingVertical: 2,
    gap: 6,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6A1B9A',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subTagline: {
    fontSize: 18,
    color: '#8E24AA',
    textAlign: 'center',
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingBottom: 6,
    marginBottom: 8,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: 'rgba(74, 20, 140, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 10,
  },
  learnMoreText: {
    fontSize: 16,
    color:'#6A1B9A',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  buttonSection: {
    paddingBottom: 40,
    gap: 18,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(225, 190, 231, 0.25)',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    gap: 15,
    minHeight: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#4A148C',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  backgroundAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  langButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  langButtonText: {
    color: '#4A148C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});