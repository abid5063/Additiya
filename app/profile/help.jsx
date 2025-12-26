import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TokenManager } from '../../utils/tokenManager';

const OPENAI_API_KEY = "test key"; // Replace with your actual OpenAI API key
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// Component for displaying hospitals in a table format
const HospitalTable = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.tableTitle}>Nearby Hospitals</Text>
      <Text style={styles.tableSubtitle}>Sorted by distance</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Name</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Distance</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Rating</Text>
      </View>
      {data.map((hospital, index) => {
        const distance = parseFloat(hospital.distance.replace(/[^\d.]/g, ''));
        const isNearest = index === 0;
        const isNearby = distance <= 5;
        
        return (
          <View key={index} style={[
            styles.tableRow,
            isNearest && styles.nearestRow,
            isNearby && styles.nearbyRow
          ]}>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                {isNearest && (
                  <View style={styles.nearestBadge}>
                    <Text style={styles.nearestBadgeText}>Nearest</Text>
                  </View>
                )}
              </View>
              <Text style={styles.hospitalAddress}>{hospital.address}</Text>
              <Text style={styles.hospitalPhone}>{hospital.phone}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
              <Text style={[
                styles.distanceText,
                isNearest && styles.nearestDistance,
                isNearby && styles.nearbyDistance
              ]}>
                {hospital.distance}
              </Text>
              {isNearby && (
                <Text style={styles.nearbyText}>Nearby</Text>
              )}
            </View>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
              {hospital.rating} ⭐
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// Component for displaying doctors in a table format
const DoctorsTable = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.tableTitle}>Nearby Doctors</Text>
      <Text style={styles.tableSubtitle}>Breast cancer specialists</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Doctor</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Specialty</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Rating</Text>
      </View>
      {data.map((doctor, index) => {
        return (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorClinic}>{doctor.clinic_hospital}</Text>
              <Text style={styles.doctorAddress}>{doctor.address}</Text>
              <Text style={styles.doctorPhone}>{doctor.phone}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text style={styles.specialtyText}>{doctor.specialty}</Text>
              {doctor.experience && (
                <Text style={styles.experienceText}>{doctor.experience}</Text>
              )}
            </View>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
              {doctor.rating} ⭐
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// Component for address input form
const AddressForm = ({ address, setAddress, onSearchHospitals, onSearchDoctors, loading, searchType }) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Find Medical Help Near You</Text>
      <Text style={styles.formSubtitle}>Enter your address to find nearby hospitals and doctors specializing in breast cancer care</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your address, city, or area..."
        value={address}
        onChangeText={setAddress}
        editable={!loading}
        multiline
        numberOfLines={2}
      />
      
      <TouchableOpacity
        style={[styles.searchButton, loading && searchType === 'hospitals' && styles.searchButtonDisabled]}
        onPress={onSearchHospitals}
        disabled={loading}
      >
        {loading && searchType === 'hospitals' ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.searchButtonText}>Search Hospitals</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.searchButton, styles.doctorButton, loading && searchType === 'doctors' && styles.searchButtonDisabled]}
        onPress={onSearchDoctors}
        disabled={loading}
      >
        {loading && searchType === 'doctors' ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.searchButtonText}>Search Doctors</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function HelpScreen() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [currentResults, setCurrentResults] = useState('');

  // Load user's address from profile data
  useEffect(() => {
    const loadUserAddress = async () => {
      try {
        const userData = await TokenManager.getUserData();
        if (userData && userData.address && !address) {
          setAddress(userData.address);
        }
      } catch (error) {
        console.error('Error loading user address:', error);
      }
    };

    loadUserAddress();
  }, []);

  const sortByDistance = (hospitals) => {
    return hospitals.sort((a, b) => {
      const distanceA = parseFloat(a.distance.replace(/[^\d.]/g, ''));
      const distanceB = parseFloat(b.distance.replace(/[^\d.]/g, ''));
      return distanceA - distanceB;
    });
  };

  const fetchHospitals = async () => {
    const searchAddress = address.trim();
    if (!searchAddress) {
      Alert.alert('Error', 'Please enter an address or ensure your profile has an address');
      return;
    }

    setLoading(true);
    setSearchType('hospitals');
    setHasSearched(true);
    setCurrentResults('hospitals');

    try {
      const prompt = `Find hospitals and medical centers near "${searchAddress}" that specialize in breast cancer screening, mammography, and oncology services.

Return ONLY a JSON array of hospitals with the following structure:
[
  {
    "name": "Hospital Name",
    "address": "Full Address", 
    "phone": "Phone Number",
    "distance": "X.X km",
    "rating": "X.X"
  }
]

Include at least 5-8 hospitals with realistic names, addresses, and phone numbers. Distances should be between 0.5 to 15 km. Ratings should be between 3.0 to 5.0.`;

      const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('OpenAI API Error:', data);
        throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
      }
      
      const aiText = data.choices?.[0]?.message?.content || 'No hospitals found';

      try {
        // Try to extract JSON from the response
        const jsonMatch = aiText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedHospitals = JSON.parse(jsonMatch[0]);
          const sortedHospitals = sortByDistance(parsedHospitals);
          setHospitals(sortedHospitals);
        } else {
          throw new Error('No valid JSON found');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        Alert.alert('Error', 'Failed to parse hospital data. Please try again.');
        setHospitals([]);
      }

    } catch (error) {
      console.error('Error fetching hospitals:', error);
      Alert.alert('Error', 'Failed to search hospitals. Please check your connection and try again.');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    const searchAddress = address.trim();
    if (!searchAddress) {
      Alert.alert('Error', 'Please enter an address or ensure your profile has an address');
      return;
    }

    setLoading(true);
    setSearchType('doctors');
    setHasSearched(true);
    setCurrentResults('doctors');

    try {
      const prompt = `Find oncologists, breast specialists, and doctors near "${searchAddress}" who specialize in breast cancer diagnosis and treatment.

Return ONLY a JSON array of doctors with the following structure:
[
  {
    "name": "Dr. Full Name",
    "specialty": "Specialty (e.g., Oncologist, Breast Surgeon)",
    "clinic_hospital": "Associated Hospital/Clinic",
    "address": "Practice Address",
    "phone": "Phone Number",
    "experience": "Years of experience or notable qualifications",
    "rating": "X.X"
  }
]

Include at least 5-8 doctors with realistic names, specialties, and contact information. Ratings should be between 3.0 to 5.0.`;

      const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('OpenAI API Error:', data);
        throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
      }
      
      const aiText = data.choices?.[0]?.message?.content || 'No doctors found';

      try {
        // Try to extract JSON from the response
        const jsonMatch = aiText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedDoctors = JSON.parse(jsonMatch[0]);
          setDoctors(parsedDoctors);
        } else {
          throw new Error('No valid JSON found');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        Alert.alert('Error', 'Failed to parse doctor data. Please try again.');
        setDoctors([]);
      }

    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Error', 'Failed to search doctors. Please check your connection and try again.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setHasSearched(false);
    setHospitals([]);
    setDoctors([]);
    setCurrentResults('');
  };

  const handleBackPress = () => {
    try {
      router.back();
    } catch (error) {
      router.replace('/');
    }
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
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Get Medical Help</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {!hasSearched ? (
          <AddressForm
            address={address}
            setAddress={setAddress}
            onSearchHospitals={fetchHospitals}
            onSearchDoctors={fetchDoctors}
            loading={loading}
            searchType={searchType}
          />
        ) : (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {currentResults === 'hospitals' ? 'Nearby Hospitals' : 'Nearby Doctors'}
              </Text>
              <TouchableOpacity style={styles.newSearchButton} onPress={handleNewSearch}>
                <Ionicons name="refresh" size={20} color="#4a89dc" />
                <Text style={styles.newSearchButtonText}>New Search</Text>
              </TouchableOpacity>
            </View>

            {currentResults === 'hospitals' && hospitals.length > 0 && (
              <HospitalTable data={hospitals} />
            )}

            {currentResults === 'doctors' && doctors.length > 0 && (
              <DoctorsTable data={doctors} />
            )}

            {hasSearched && ((currentResults === 'hospitals' && hospitals.length === 0) || 
                              (currentResults === 'doctors' && doctors.length === 0)) && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="medical-outline" size={64} color="#ccc" />
                <Text style={styles.noResultsText}>
                  No {currentResults} found for this location
                </Text>
                <TouchableOpacity style={styles.tryAgainButton} onPress={handleNewSearch}>
                  <Text style={styles.tryAgainButtonText}>Try Different Location</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Search buttons in results view */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.searchButton, loading && searchType === 'hospitals' && styles.searchButtonDisabled]}
                onPress={fetchHospitals}
                disabled={loading}
              >
                {loading && searchType === 'hospitals' ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchButtonText}>Search Hospitals</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.searchButton, styles.doctorButton, loading && searchType === 'doctors' && styles.searchButtonDisabled]}
                onPress={fetchDoctors}
                disabled={loading}
              >
                {loading && searchType === 'doctors' ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchButtonText}>Search Doctors</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  gradientBackground: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
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
    padding: 5 
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '700', 
    textAlign: 'center', 
    flex: 1 
  },
  headerRight: { 
    width: 32 
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  // Form styles
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A148C',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    color: '#4A148C',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A148C',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  // Table styles for hospitals
  tableContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A148C',
    marginBottom: 4,
    textAlign: 'center',
  },
  tableSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#495057',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  nearestRow: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 4,
    borderLeftColor: '#095b2bff',
  },
  nearbyRow: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    fontSize: 13,
    color: '#333',
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hospitalName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  nearestBadge: {
    backgroundColor: '#04652cff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  nearestBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hospitalAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  hospitalPhone: {
    fontSize: 12,
    color: '#04459aff',
    marginTop: 2,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  nearestDistance: {
    color: '#045c29ff',
    fontWeight: 'bold',
  },
  nearbyDistance: {
    color: '#053471ff',
    fontWeight: '500',
  },
  nearbyText: {
    fontSize: 10,
    color: '#4a89dc',
    marginTop: 2,
  },
  resultsContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A148C',
  },
  newSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 20, 140, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A148C',
  },
  newSearchButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4A148C',
    fontWeight: '600',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  tryAgainButton: {
    backgroundColor: '#4A148C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  tryAgainButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  // Doctor-specific styles
  doctorButton: {
    backgroundColor: '#7B1FA2',
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 20, 140, 0.2)',
  },
  doctorName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#4A148C',
    flex: 1,
  },
  doctorClinic: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  specialtyText: {
    fontSize: 10,
    color: '#7B1FA2',
    fontWeight: '700',
    marginTop: 2,
  },
});