// API Configuration for ADDITIYA Mobile App

// Try different configurations based on your setup:

// Option 1: If running backend on localhost:3000 and testing on web
export const API_BASE_URL = 'http://localhost:3000';
export const allert=0;

// Option 2: If testing on Android Emulator, use this instead:
// export const API_BASE_URL = 'http://10.0.2.2:3000';

// Option 3: If testing on iOS Simulator, use this instead:
// export const API_BASE_URL = 'http://127.0.0.1:3000';

// Option 4: If testing on physical device, use your computer's IP address:
// export const API_BASE_URL = 'http://192.168.1.XXX:3000'; // Replace XXX with your IP

// Option 5: If you have a deployed backend server:
// export const API_BASE_URL = 'http://57.158.25.157:80';

console.log('API_BASE_URL configured as:', API_BASE_URL);
