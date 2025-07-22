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

// Create context for the left menu
export const LeftMenuContext = createContext({
  toggleLeftMenu: () => {},
  leftMenuVisible: false,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [leftMenuVisible, setLeftMenuVisible] = useState(false);
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
      <LeftMenuContext.Provider value={{ toggleLeftMenu, leftMenuVisible }}>
        <Stack 
          screenOptions={{
            headerLeft: () => <LeftMenuButton />,
            headerTitle: '',
            headerBackVisible: false,
            contentStyle: { flex: 1 }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="chat" />
          <Stack.Screen name="history" />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </LeftMenuContext.Provider>
    </ThemeProvider>
  );
}
