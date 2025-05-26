export interface Message {
  id?: string;
  message: string;
  response: string;
  isUser?: boolean;
  created_at?: string;
  updated_at?: string;
  suggestion_question?: string;
}

export interface Chat {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  messages: Message[];
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
}
