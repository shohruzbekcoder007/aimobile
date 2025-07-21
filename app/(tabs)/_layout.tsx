import { getUserInfo, isLoggedIn, logoutUser } from '@/services/chatApi';
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  menuNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  menuNavItemText: {
    marginLeft: 10,
    fontSize: 14,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2B68E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  menuContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: '#F0F0F0',
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  welcomeText: {
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activeTabIconContainer: {
    backgroundColor: 'rgba(43, 104, 230, 0.1)',
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

                <TouchableOpacity style={styles.menuNavItem} onPress={() => {
                  setMenuVisible(false);
                  // Sozlamalar sahifasi mavjud bo'lsa o'tish
                  router.push('/');
                }}>
                  <Ionicons name="settings-outline" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
                  <Text style={[styles.menuNavItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Sozlamalar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuNavItem} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.menuNavItemText, { color: "#FF3B30" }]}>Chiqish</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.menuNavItem} onPress={navigateToLogin}>
                <Ionicons name="log-in-outline" size={20} color={Colors[colorScheme ?? 'light'].tint} />
                <Text style={[styles.menuNavItemText, { color: Colors[colorScheme ?? 'light'].tint }]}>Kirish</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#2B9CFF',
            tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
            headerShown: true,
            tabBarShowLabel: true,
            tabBarActiveBackgroundColor: Colors[colorScheme ?? 'light'].background,
            tabBarInactiveBackgroundColor: Colors[colorScheme ?? 'light'].background,
            tabBarBackground: () => (
              <View style={{ backgroundColor: Colors[colorScheme ?? 'light'].background }} />
            ),
            tabBarStyle: {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              height: 60,
              borderTopWidth: 0,
              borderRadius: 20,
              marginHorizontal: 16,
              marginBottom: 8,
              // position: 'absolute',
              // bottom: 0,
              // left: 0,
              // right: 0,
              elevation: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              paddingBottom: 5,
              paddingTop: 5,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginTop: -5,
            },
            tabBarItemStyle: {
              marginHorizontal: 5,
            },
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
              title: 'Asosiy',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                  <Ionicons name="home" size={24} color={color} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Chat',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                  <Ionicons name="chatbox" size={24} color={color} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'Tarix',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                  <Ionicons name="time" size={24} color={color} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: 'Qidiruv',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                  <Ionicons name="search" size={24} color={color} />
                </View>
              ),
            }}
          />
        </Tabs>
      </View>
    </>
  );
}
