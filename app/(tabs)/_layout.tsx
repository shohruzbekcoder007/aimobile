import { LeftMenuContext } from '@/app/_layout';
import LeftMenu from '@/components/LeftMenu';
import { getUserChats, getUserInfo, isLoggedIn } from '@/services/chatApi';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

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
  const [chats, setChats] = useState([]);
  const { 
    toggleLeftMenu, 
    leftMenuVisible, 
    userInfo, 
    setUserInfo, 
    isUserLoggedIn, 
    setIsUserLoggedIn 
  } = useContext(LeftMenuContext);
  const [menuVisible, setMenuVisible] = useState(false);

  // Foydalanuvchi ma'lumotlarini olish
  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await isLoggedIn();
      setIsUserLoggedIn(loggedIn);

      if (loggedIn) {
        const info = await getUserInfo();
        setUserInfo(info);
        
        // Chat tarixini olish
        try {
          const response = await getUserChats();
          if (response.success && response.chats) {
            setChats(response.chats);
          }
        } catch (err) {
          console.error('Failed to load chats:', err);
        }
      }
    };

    checkLoginStatus();
  }, [setIsUserLoggedIn, setUserInfo]); // Add context setters to dependencies

  // Foydalanuvchi menyusini ochish/yopish
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <>

      <View style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
        {/* LeftMenu komponentini barcha tablar uchun qo'shish */}
        <LeftMenu 
          chats={chats} 
          formatDate={(dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }}
        />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
            headerLeft: () => (
              <TouchableOpacity
                onPress={toggleLeftMenu}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu-outline" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            )
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: '',
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
              title: '',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                  <Ionicons name="chatbox" size={24} color={color} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: '',
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
