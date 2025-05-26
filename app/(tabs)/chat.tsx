import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Using a simple function to generate IDs instead of uuid which requires crypto.getRandomValues()

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { sendMessage, getChatHistory, isLoggedIn, streamChatResponse } from '@/services/chatApi';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function TabChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  // Generate a simple unique ID based on timestamp and random number
  const generateId = () => {
    return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  };

  useEffect(() => {
    // Initialize chat
    initChat();
  }, []);
  
  // Initialize chat ID when component mounts
  const initChat = async () => {
    try {
      let storedChatId = await AsyncStorage.getItem('currentChatId');
      
      if (!storedChatId) {
        storedChatId = generateId();
        await AsyncStorage.setItem('currentChatId', storedChatId);
      }
      
      setChatId(storedChatId || '');
      
      // Oldingi xabarlarni yuklash
      if (storedChatId) {
        loadChatHistory(storedChatId);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      // If there's an error, still set a default chat ID
      setChatId(generateId());
    }
  };
  
  // Oldingi xabarlarni yuklash funksiyasi
  const loadChatHistory = async (chatId: string) => {
    try {
      setIsLoading(true);
      const response = await getChatHistory(chatId);
      
      if (response.messages && Array.isArray(response.messages)) {
        // API dan kelgan xabarlarni formatlab olish
        const formattedMessages = response.messages.map((msg: any) => ({
          id: msg.id || generateId(),
          text: msg.content || msg.text,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.timestamp || Date.now())
        }));
        
        setMessages(formattedMessages);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 200);
      } else if (response.error) {
        console.error('Error loading chat history:', response.error);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Avval bo'sh xabar yaratish
      const botMessageId = generateId();
      const initialBotMessage: Message = {
        id: botMessageId,
        text: "", // Bo'sh xabar, stream bilan to'ldiriladi
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, initialBotMessage]);
      
      // To'g'ridan-to'g'ri /chat/stream endpointiga so'rov yuborish
      try {
        await streamChatResponse(
          userMessage.text,
          // Har bir chunk kelganda xabarni yangilash
          (chunk) => {
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages];
              const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
              
              if (botMessageIndex !== -1) {
                // Mavjud xabarni yangilash
                updatedMessages[botMessageIndex] = {
                  ...updatedMessages[botMessageIndex],
                  text: updatedMessages[botMessageIndex].text + chunk
                };
              }
              
              return updatedMessages;
            });
            
            // Scroll to bottom
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);
          },
          // Javob to'liq kelganda
          (fullResponse) => {
            setIsLoading(false);
          },
          // Chat ID (ixtiyoriy)
          chatId
        );
      } catch (streamError) {
        console.error('Stream error:', streamError);
        
        // Update the bot message to show the error
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
          
          if (botMessageIndex !== -1) {
            updatedMessages[botMessageIndex] = {
              ...updatedMessages[botMessageIndex],
              text: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
            };
          }
          
          return updatedMessages;
        });
        
        Alert.alert('Xato', 'Xabar yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Xato', 'Xabar yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ThemedView 
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble
      ]}
    >
      <ThemedText style={item.isUser ? styles.userMessageText : styles.botMessageText}>
        {item.text}
      </ThemedText>
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'AI Chat',
          headerLargeTitle: true,
        }}
      />
      
      <ThemedView style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                Savolingizni yuboring va AI chatbot bilan suhbatlashing
              </ThemedText>
            </ThemedView>
          }
        />
        
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Savolingizni kiriting..."
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.disabledButton]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2B68E6',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2B68E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.6,
  },
});
