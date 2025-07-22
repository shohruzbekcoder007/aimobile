import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getChatHistory, getChatId, streamChatResponse } from '@/services/chatApi';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  chat_id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function sanitizeToMarkdown(text: string): string {
  return text
    .replace(/<b>|<\/b>/gi, '**')
    .replace(/<i>|<\/i>/gi, '*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, ""); // boshqa HTML teglardan tozalaydi
}

export default function TabChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  const generateId = () => `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    const response = await getChatId();
    const chat_id = response;
    console.log(chat_id, "<-response");
    setChatId(chat_id || '');
    loadChatHistory(chat_id);
  };

  const loadChatHistory = async (chatId: string) => {
    try {
      setIsLoading(true);
      const response = await getChatHistory(chatId);
      if (response.messages && Array.isArray(response.messages)) {
        const formattedMessages = response.messages.map((msg: any) => ({
          chat_id: msg.id || generateId(),
          text: msg.content || msg.text,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.timestamp || Date.now())
        }));
        setMessages(formattedMessages);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
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
      chat_id: chatId,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const botMessageId = generateId();
      const initialBotMessage: Message = {
        chat_id: botMessageId,
        text: "",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, initialBotMessage]);

      await streamChatResponse(
        userMessage.text,
        (chunk: string | any) => {
          // Ensure chunk is a string
          const chunkStr = typeof chunk === 'string' ? chunk : String(chunk);
          
          setMessages(prevMessages => {
            const updated = [...prevMessages];
            const index = updated.findIndex(msg => msg.chat_id === botMessageId);
            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                text: updated[index].text + sanitizeToMarkdown(chunkStr),
              };
            }
            return updated;
          });
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
        },
        () => {
          setIsLoading(false);
        },
        chatId
      );
    } catch (error) {
      console.error('Stream error:', error);
      Alert.alert('Xato', 'Xabar yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      setMessages(prev => {
        const updated = [...prev];
        const index = updated.findIndex(msg => !msg.isUser && msg.text === '');
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            text: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
          };
        }
        return updated;
      });
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // Ensure item.text is always a string to prevent Markdown component errors
    const messageText = typeof item.text === 'string' ? item.text : String(item.text || '');
    
    return (
      <ThemedView 
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.botBubble
        ]}
      >
        {item.isUser ? (
          <ThemedText style={styles.userMessageText}>{messageText}</ThemedText>
        ) : (
          <Markdown style={markdownStyles}>{messageText}</Markdown>
        )}
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
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
          keyExtractor={(item, index) => String(index)}
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

const markdownStyles = {
  body: {
    color: '#000000',
    fontSize: 15,
  },
  code_inline: {
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'Courier',
  },
  code_block: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 6,
    fontFamily: 'Courier',
  },
};
