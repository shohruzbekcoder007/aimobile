import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef, createContext, useContext } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import 'react-native-reanimated';

// Define types for context
export interface UserInfo {
  name?: string;
  email?: string;
  // Add other user properties as needed
}

export interface LeftMenuContextType {
  toggleLeftMenu: () => void;
  leftMenuVisible: boolean;
  isUserLoggedIn: boolean;
  setIsUserLoggedIn: (value: boolean) => void;
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo | null) => void;
}

// Create context for the left menu with default values
export const LeftMenuContext = createContext<LeftMenuContextType>({
  toggleLeftMenu: () => {},
  leftMenuVisible: false,
  isUserLoggedIn: false,
  setIsUserLoggedIn: () => {},
  userInfo: null,
  setUserInfo: () => {}
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [leftMenuVisible, setLeftMenuVisible] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const toggleLeftMenu = () => {
    setLeftMenuVisible(!leftMenuVisible);
  };

  // Left menu toggle button component
  const LeftMenuButton = () => (
    <TouchableOpacity onPress={toggleLeftMenu} style={{ marginLeft: 16 }}>
      <Ionicons name="menu-outline" size={24} color={Colors[colorScheme ?? 'light'].text} />
    </TouchableOpacity>
  );

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LeftMenuContext.Provider value={{ 
        toggleLeftMenu, 
        leftMenuVisible, 
        isUserLoggedIn, 
        setIsUserLoggedIn,
        userInfo,
        setUserInfo 
      }}>
        <Stack 
          screenOptions={{
            headerLeft: () => <LeftMenuButton />,
            headerTitle: '',
            headerBackVisible: false,
            contentStyle: { flex: 1 }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </LeftMenuContext.Provider>
    </ThemeProvider>
  );
}
