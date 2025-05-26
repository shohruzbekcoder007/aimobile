import { getUserInfo, isLoggedIn, logoutUser } from '@/services/chatApi';
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Stillar obyekti
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    width: 220,
    marginTop: 50,
    marginRight: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  userInfoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 14,
  },
  profileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Foydalanuvchi ma'lumotlarini olish
  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await isLoggedIn();
      setIsUserLoggedIn(loggedIn);

      if (loggedIn) {
        const info = await getUserInfo();
        setUserInfo(info);
      }
    };

    checkLoginStatus();
  }, []);

  // Login ekraniga o'tish funksiyasi
  const navigateToLogin = () => {
    setMenuVisible(false);
    router.push('/login');
  };

  // Tizimdan chiqish funksiyasi
  const handleLogout = async () => {
    await logoutUser();
    setUserInfo(null);
    setIsUserLoggedIn(false);
    setMenuVisible(false);
    router.replace('/');
  };

  // Foydalanuvchi menyusini ochish/yopish
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  
  return (
    <>
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            {isUserLoggedIn && userInfo ? (
              <>
                <View style={styles.userInfoContainer}>
                  <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>{userInfo.name || userInfo.email}</Text>
                  <Text style={[styles.userStatus, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Aktiv foydalanuvchi</Text>
                </View>
                
                <TouchableOpacity style={styles.menuItem} onPress={() => {
                  setMenuVisible(false);
                  // Sozlamalar sahifasi mavjud bo'lsa o'tish
                  router.push('/');
                }}>
                  <Ionicons name="settings-outline" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
                  <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Sozlamalar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>Chiqish</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={navigateToLogin}>
                <Ionicons name="log-in-outline" size={20} color={Colors[colorScheme ?? 'light'].tint} />
                <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].tint }]}>Kirish</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
          // Header'ga profil tugmasini qo'shish
          headerRight: () => (
            <TouchableOpacity 
              onPress={toggleMenu} 
              style={{ marginRight: 15 }}
            >
              {isUserLoggedIn ? (
                <View style={styles.profileButton}>
                  <Text style={styles.profileButtonText}>{userInfo?.name?.charAt(0) || userInfo?.email?.charAt(0) || 'U'}</Text>
                </View>
              ) : (
                <Ionicons name="person-circle-outline" size={24} color={Colors[colorScheme ?? 'light'].text} />
              )}
            </TouchableOpacity>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'AI Chat',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
