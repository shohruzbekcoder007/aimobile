import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { getChatHistory, getChatId, getUserChats, getUserInfo, isLoggedIn, streamChatResponse } from '@/services/chatApi';
import { Chat } from '@/types/chat';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';

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
  const [leftMenuVisible, setLeftMenuVisible] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const leftMenuAnim = useRef(new Animated.Value(-300)).current;
  const colorScheme = useColorScheme();

  const generateId = () => `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  useEffect(() => {
    initChat();
    checkLoginStatus();
    loadChatsList();
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

  const toggleLeftMenu = () => {
    if (leftMenuVisible) {
      // Menu yopish animatsiyasi
      Animated.timing(leftMenuAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setLeftMenuVisible(false));
    } else {
      setLeftMenuVisible(true);
      // Menu ochish animatsiyasi
      Animated.timing(leftMenuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const checkLoginStatus = async () => {
    const loggedIn = await isLoggedIn();
    setIsUserLoggedIn(loggedIn);

    if (loggedIn) {
      const info = await getUserInfo();
      setUserInfo(info);
    }
  };

  const loadChatsList = async () => {
    try {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) return;

      const response = await getUserChats();
      if (response.success && response.chats) {
        setChats(response.chats);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  const handleChatPress = (selectedChatId: string) => {
    setChatId(selectedChatId);
    loadChatHistory(selectedChatId);
    toggleLeftMenu();
  };

  const handleNewChat = () => {
    initChat();
    toggleLeftMenu();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'AI Chat',
          headerLargeTitle: true,
          headerLeft: () => (
            <TouchableOpacity onPress={toggleLeftMenu}>
              <Ionicons name="menu-outline" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView style={styles.container}>
        {/* Chap menu */}
        {leftMenuVisible && (
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={toggleLeftMenu}
          />
        )}
        <Animated.View
          style={[
            styles.leftMenu,
            { transform: [{ translateX: leftMenuAnim }] },
            { backgroundColor: Colors[colorScheme ?? 'light'].background }
          ]}
        >
          <ScrollView>
            <ThemedView style={styles.leftMenuHeader}>
              <ThemedText style={styles.leftMenuTitle}>AI Chat Assistant</ThemedText>
              <TouchableOpacity onPress={toggleLeftMenu}>
                <Ionicons name="close-outline" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            </ThemedView>

            {/* Account section */}
            <ThemedView style={styles.accountSection}>
              {isUserLoggedIn ? (
                <>
                  <View style={styles.accountAvatar}>
                    <ThemedText style={styles.avatarText}>
                      {userInfo?.name?.charAt(0) || userInfo?.email?.charAt(0) || 'U'}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.accountName}>
                    {userInfo?.name || userInfo?.email || 'Foydalanuvchi'}
                  </ThemedText>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => {
                    toggleLeftMenu();
                    router.push('/login');
                  }}
                >
                  <ThemedText style={styles.loginButtonText}>Kirish</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>

            <ThemedView style={styles.menuSeparator} />

            {/* New Chat button */}
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={handleNewChat}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText style={[styles.newChatText, {color: Colors[colorScheme ?? 'light'].tint}]}>
                Yangi chat boshlash
              </ThemedText>
            </TouchableOpacity>

            {/* Chat history list */}
            <ThemedText style={styles.historyTitle}>Chat tarixi</ThemedText>
            {chats.length > 0 ? (
              chats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  style={[styles.historyItem, chat.id === chatId && styles.activeHistoryItem]}
                  onPress={() => handleChatPress(chat.id)}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={Colors[colorScheme ?? 'light'].text} />
                  <ThemedView style={styles.historyItemContent}>
                    <ThemedText style={styles.historyItemName} numberOfLines={1}>
                      {chat.name}
                    </ThemedText>
                    <ThemedText style={styles.historyItemDate}>
                      {formatDate(chat.updated_at)}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))
            ) : (
              <ThemedText style={styles.emptyHistoryText}>
                Hech qanday chat tarixi yo'q
              </ThemedText>
            )}
          </ScrollView>
        </Animated.View>
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
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  leftMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  leftMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  leftMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountSection: {
    padding: 16,
    alignItems: 'center',
  },
  accountAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2B68E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2B68E6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(43, 104, 230, 0.1)',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  newChatText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 4,
  },
  activeHistoryItem: {
    backgroundColor: 'rgba(43, 104, 230, 0.1)',
  },
  historyItemContent: {
    flex: 1,
    marginLeft: 10,
  },
  historyItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyItemDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyHistoryText: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
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
