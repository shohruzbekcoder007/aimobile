import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { loginUser, registerUser } from '@/services/chatApi';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (isRegistering && !name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isRegistering) {
        await registerUser(email, password, name);
        Alert.alert('Success', 'Registration successful! Please log in.');
        setIsRegistering(false);
      } else {
        const response = await loginUser(email, password);
        if (response && response.access_token) {
          router.replace('/');
        } else {
          Alert.alert('Error', 'Login failed. Please check your credentials.');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: isRegistering ? 'Register' : 'Login',
          headerLargeTitle: true,
        }}
      />
      
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>
          {isRegistering ? 'Create an Account' : 'Welcome Back'}
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          {isRegistering 
            ? 'Sign up to save your chat history and preferences' 
            : 'Log in to access your saved chats'}
        </ThemedText>
        
        {isRegistering && (
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!isLoading}
          />
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          editable={!isLoading}
        />
        
        <TouchableOpacity
          style={styles.authButton}
          onPress={handleAuth}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.authButtonText}>
              {isRegistering ? 'Register' : 'Login'}
            </ThemedText>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsRegistering(!isRegistering)}
          disabled={isLoading}
        >
          <ThemedText style={styles.switchButtonText}>
            {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleContinueAsGuest}
          disabled={isLoading}
        >
          <ThemedText style={styles.guestButtonText}>
            Continue as Guest
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: '#2B68E6',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 14,
  },
  guestButton: {
    marginTop: 30,
    padding: 10,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 14,
    opacity: 0.7,
  },
});
