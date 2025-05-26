import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>AI Chatbot</ThemedText>
          <ThemedText style={styles.subtitle}>Chatbotwithui API bilan ishlaydi</ThemedText>
        </View>

        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.sectionTitle}>Imkoniyatlar:</ThemedText>
          <ThemedText style={styles.featureText}>
            • Sunʼiy intellekt bilan suhbat{"\n"}
            • Savollaringizga javoblar olish{"\n"}
            • Oʻzbek va rus tillarida muloqot{"\n"}
            • Suhbat tarixini saqlash{"\n"}
            • Foydalanuvchi autentifikatsiyasi
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.sectionTitle}>Qanday foydalanish kerak:</ThemedText>
          <ThemedText style={styles.instructionText}>
            "AI Chat" tugmasini bosing va savolingizni kiriting. Tizim sizga javob beradi va qoʻshimcha savollar taklif qiladi.
          </ThemedText>
        </ThemedView>

        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => router.push('/chat')}
        >
          <ThemedText style={styles.chatButtonText}>Suhbatni boshlash</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.noteContainer}>
          <ThemedText style={styles.noteText}>
            Eslatma: Bu ilova chatbotwithui API serveriga ulanishni talab qiladi. Server manzilini services/chatApi.ts faylida API_URL oʻzgaruvchisida koʻrsating.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  infoContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(43, 104, 230, 0.05)',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 24,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  chatButton: {
    backgroundColor: '#2B68E6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteContainer: {
    backgroundColor: 'rgba(255, 217, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD900',
    marginTop: 8,
  },
  noteText: {
    fontSize: 14,
    opacity: 0.8,
  },
});
