import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext, useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LeftMenuContext } from '@/app/_layout';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Chat } from '@/types/chat';

interface LeftMenuProps {
  isUserLoggedIn: boolean;
  userInfo: any;
  chats?: Chat[];
  formatDate?: (dateString: string) => string;
}

export default function LeftMenu({ isUserLoggedIn, userInfo, chats = [], formatDate }: LeftMenuProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { leftMenuVisible, toggleLeftMenu } = useContext(LeftMenuContext);
  const leftMenuAnim = useRef(new Animated.Value(-300)).current;
  
  useEffect(() => {
    if (leftMenuVisible) {
      Animated.timing(leftMenuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(leftMenuAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [leftMenuVisible, leftMenuAnim]);

  const handleNewChat = () => {
    toggleLeftMenu();
    router.push('/chat');
  };

  const handleChatPress = (chatId: string) => {
    toggleLeftMenu();
    router.push({pathname: '/chat', params: {chatId}});
  };

  const handleLogin = () => {
    toggleLeftMenu();
    router.push('/login');
  };

  const formatChatDate = (dateString: string) => {
    if (formatDate) {
      return formatDate(dateString);
    }
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
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
          { backgroundColor: theme.background }
        ]}
      >
        <ScrollView>
          <ThemedView style={styles.leftMenuHeader}>
            <ThemedText style={styles.leftMenuTitle}>AI Chat Assistant</ThemedText>
            <TouchableOpacity onPress={toggleLeftMenu}>
              <Ionicons name="close-outline" size={24} color={theme.text} />
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
              <>
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <ThemedText style={styles.loginButtonText}>Login</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ThemedView>

          <View style={styles.menuSeparator} />

          {/* Yangidan chat boshlash tugmasi */}
          <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
            <Ionicons name="add-circle-outline" size={22} color={theme.tint} />
            <ThemedText style={styles.newChatText}>Yangi chat boshlash</ThemedText>
          </TouchableOpacity>

          {/* Chat history list */}
          <ThemedText style={{ marginLeft: 16, marginVertical: 8, fontWeight: '500' }}>Suhbatlar tarixi</ThemedText>
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.historyNavButton}
              onPress={() => handleChatPress(chat.id)}
            >
              <Ionicons name="chatbubble-outline" size={20} color={theme.text} />
              <ThemedText style={styles.menuItemText} numberOfLines={1}>
                {chat.name || 'Chat #' + chat.id.substring(0, 6)}
              </ThemedText>
              <ThemedText style={styles.chatDate}>
                {formatChatDate(chat.created_at)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
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
  historyNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  newChatText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 8,
    fontWeight: '500',
  },
  chatDate: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 4,
  },
});
