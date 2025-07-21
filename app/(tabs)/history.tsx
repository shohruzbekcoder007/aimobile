import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getUserChats, isLoggedIn } from '@/services/chatApi';
import { Chat } from '@/types/chat';

export default function TabHistoryScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    // Load chats
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      
      // Foydalanuvchi login qilganligini tekshirish
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        // Foydalanuvchi login qilmagan, xabarni ko'rsatish
        setError('Please log in to view your chat history');
        setIsLoading(false);
        return;
      }
      
      const response = await getUserChats();
      console.log(response, "<-response");
      if (response.success && response.chats) {
        setChats(response.chats);
      } else {
        // API dan qaytgan xatoni ko'rsatish
        setError(response.error || 'Failed to load chat history');
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError('Failed to load chat history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatPress = (chatId: string) => {
    router.push({pathname: '/chat', params: {chatId}});
  };

  const handleNewChat = () => {
    router.push('/chat');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: 'Chat History',
            headerLargeTitle: true,
          }}
        />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Chat History',
          headerLargeTitle: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleNewChat}>
              <Ionicons name="add-circle-outline" size={24} color={theme.tint} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ThemedView style={styles.container}>
        {error ? (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chatItem}
                onPress={() => handleChatPress(item.id)}
              >
                <ThemedView style={styles.chatItemContent}>
                  <ThemedText style={styles.chatName} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.chatDate}>
                    {formatDate(item.updated_at)}
                  </ThemedText>
                </ThemedView>
                <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <ThemedView style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  No chat history found. Start a new chat!
                </ThemedText>
                <TouchableOpacity
                  style={styles.newChatButton}
                  onPress={handleNewChat}
                >
                  <ThemedText style={styles.newChatButtonText}>
                    Start New Chat
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            }
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  chatItemContent: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  chatDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 20,
  },
  newChatButton: {
    backgroundColor: '#2B68E6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});
