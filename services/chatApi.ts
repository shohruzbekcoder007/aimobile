import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL for the API - production server URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourchatbotdomain.com' // O'zgartiring: production server URL
  : 'http://172.16.8.38:8000'; // Development server URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Check if user is logged in
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Save user information
export const saveUserInfo = async (userInfo: any) => {
  try {
    await AsyncStorage.setItem('user_info', JSON.stringify(userInfo));
  } catch (error) {
    console.error('Error saving user info:', error);
  }
};

// Get user information
export const getUserInfo = async () => {
  try {
    const userInfo = await AsyncStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

// Authentication functions
export const loginUser = async (email: string, password: string) => {
  try {
    // Using URLSearchParams instead of FormData for better compatibility
    const params = new URLSearchParams();
    params.append('username', email); // Using 'username' as the field name for email as expected by OAuth2PasswordRequestForm
    params.append('password', password);

    const response = await api.post('/auth/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.access_token) {
      await AsyncStorage.setItem('access_token', response.data.access_token);
      
      // Extract user info from JWT token or create basic user info
      try {
        // Try to get user info from server if endpoint exists
        const userResponse = await api.get('/auth/me', {
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`
          }
        });
        
        if (userResponse.data) {
          // Save user information from server
          await saveUserInfo(userResponse.data);
        }
      } catch (userError) {
        console.error('Error fetching user info:', userError);
        
        // Create basic user info from email since /users/me endpoint failed
        const basicUserInfo = {
          email: email,
          name: email.split('@')[0] // Use part before @ as name
        };
        
        // Save basic user information
        await saveUserInfo(basicUserInfo);
      }
      
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const response = await api.post('/register', { email, password, name });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('user_info');
};

// Chat functions
export const sendMessage = async (query: string, chatId?: string) => {
  try {
    // Using the ChatRequest format from the chatbotwithui API
    const response = await api.post('/chat', {
      query,
      chat_id: chatId
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    // Return a formatted error that our app can handle
    return {
      error: error.response?.data?.detail || 'Failed to connect to the server. Please check your connection.'
    };
  }
};

// Stream chat response function for React Native
export const streamChatResponse = async (query: string, onChunk: (chunk: string) => void, onComplete: (fullResponse: string) => void, chatId?: string) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new XMLHttpRequest which has better streaming support in React Native
      const xhr = new XMLHttpRequest();
      let fullResponse = '';
      let buffer = '';
      
      // Configure the request
      xhr.open('POST', `${API_URL}/chat/stream`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      // Add authentication if available
      AsyncStorage.getItem('access_token').then(token => {
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        // Set up event handlers
        xhr.onprogress = function() {
          // Get new data since last progress event
          const newData = xhr.responseText.substring(buffer.length);
          buffer = xhr.responseText;
          
          if (newData) {
            // Process the new data as a complete chunk
            // This ensures words are properly joined together
            fullResponse += newData;
            onChunk(newData);
          }
        };
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            onComplete(fullResponse);
            resolve(true);
          } else {
            const error = new Error(`HTTP error! status: ${xhr.status}`);
            console.error('Stream error:', error);
            onComplete('');
            reject(error);
          }
        };
        
        xhr.onerror = function() {
          const error = new Error('Network error occurred');
          console.error('Stream error:', error);
          onComplete('');
          reject(error);
        };
        
        xhr.ontimeout = function() {
          const error = new Error('Request timed out');
          console.error('Stream error:', error);
          onComplete('');
          reject(error);
        };
        
        // Send the request with the query and chat ID
        xhr.send(JSON.stringify({
          query,
          chat_id: chatId,
          device: 'mobile'
        }));
      }).catch(error => {
        console.error('Error getting auth token:', error);
        reject(error);
      });
    } catch (error: any) {
      console.error('Error streaming chat response:', error);
      onComplete('');
      reject(error);
    }
  });
};

// Note: The simulated stream functionality has been integrated directly into the streamChatResponse function

export const getChatHistory = async (chatId: string) => {
  try {
    const response = await api.get(`/api/chat-history/${chatId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting chat history:', error);
    return {
      error: error.response?.data?.detail || 'Failed to retrieve chat history.'
    };
  }
};

export const getChatId = async () => {
  try {
    const response = await api.get('/idmobile');
    return response.data.chat_id;
  } catch (error: any) {
    console.error('Error getting chat ID:', error);
    return null;
  }
};

export const getUserChats = async () => {
  try {
    const response = await api.get('/api/user-chats');
    return response.data;
  } catch (error: any) {
    console.error('Error getting user chats:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to load chats. Please check your connection.'
    };
  }
};

// Stream chat function - returns a URL for EventSource
export const getStreamChatUrl = (query: string, chatId: string) => {
  return `${API_URL}/chat/stream?query=${encodeURIComponent(query)}&chat_id=${chatId}&device=mobile`;
};

// Function to submit feedback
export const submitFeedback = async (feedback: {
  message_text: string;
  answer_text: string;
  feedback_type: string;
  comment?: string;
}) => {
  try {
    const response = await api.post('/api/feedback', feedback);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export default api;
