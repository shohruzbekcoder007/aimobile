import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LeftMenuContext, LeftMenuContextType } from '@/app/_layout';
import { useContext } from 'react';
import { logoutUser } from '@/services/chatApi';

interface UserInfo {
  name?: string;
  email?: string;
  // Add other user properties as needed
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { userInfo, setIsUserLoggedIn, setUserInfo } = useContext(LeftMenuContext);

  const handleLogout = () => {
    Alert.alert(
      "Chiqish",
      "Haqiqatan ham hisobingizdan chiqmoqchimisiz?",
      [
        {
          text: "Bekor qilish",
          style: "cancel"
        },
        { 
          text: "Chiqish", 
          onPress: async () => {
            try {
              // Call the logoutUser function to clear tokens and user info
              await logoutUser();
              
              // Update context state
              setIsUserLoggedIn(false);
              setUserInfo(null);
              
              // Navigate back to home screen
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Xato', 'Hisobdan chiqishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
            }
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Profil</ThemedText>
      </View>

      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
          <ThemedText style={styles.avatarText}>
            {userInfo?.name?.charAt(0)?.toUpperCase() || 
             userInfo?.email?.charAt(0)?.toUpperCase() || 'U'}
          </ThemedText>
        </View>
        <ThemedText style={[styles.name, { color: theme.text }]}>
          {userInfo?.name || 'Foydalanuvchi'}
        </ThemedText>
        {userInfo?.email && (
          <ThemedText style={[styles.email, { color: theme.text, opacity: 0.7 }]}>
            {userInfo.email}
          </ThemedText>
        )}
      </View>

      <View style={[styles.menu, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: theme.border }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <ThemedText style={[styles.menuText, { color: '#FF3B30' }]}>
            Hisobdan chiqish
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    paddingTop: 50, // Add padding for status bar
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  menu: {
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
  },
});