import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  suggestionQuestion?: string;
  onSuggestionPress?: (suggestion: string) => void;
}

export default function ChatMessage({ 
  message, 
  isUser, 
  suggestionQuestion, 
  onSuggestionPress 
}: ChatMessageProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const markdownStyles = {
    body: {
      color: isUser ? '#fff' : theme.text,
      fontSize: 16,
    },
    paragraph: {
      marginVertical: 8,
    },
    link: {
      color: isUser ? '#E0E0FF' : theme.tint,
    },
    strong: {
      fontWeight: '700' as const,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    code_block: {
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
      padding: 10,
      borderRadius: 5,
      fontFamily: 'monospace',
    },
    code_inline: {
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
      fontFamily: 'monospace',
      padding: 2,
    },
  };

  return (
    <ThemedView style={[
      styles.container, 
      isUser ? styles.userContainer : styles.botContainer
    ]}>
      <View style={styles.messageContainer}>
        {isUser ? (
          <ThemedText style={[styles.messageText, styles.userMessageText]}>
            {message}
          </ThemedText>
        ) : (
          <Markdown style={markdownStyles}>
            {message}
          </Markdown>
        )}
      </View>

      {!isUser && suggestionQuestion && (
        <View style={styles.suggestionContainer}>
          <ThemedText style={styles.suggestionTitle}>Tavsiya qilingan savol:</ThemedText>
          <TouchableOpacity 
            style={styles.suggestionButton}
            onPress={() => onSuggestionPress && onSuggestionPress(suggestionQuestion)}
          >
            <ThemedText style={styles.suggestionText}>{suggestionQuestion}</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#2B68E6',
    borderTopRightRadius: 0,
  },
  botContainer: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageContainer: {
    flexDirection: 'row',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  suggestionContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 8,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  suggestionButton: {
    backgroundColor: 'rgba(43, 104, 230, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
});
