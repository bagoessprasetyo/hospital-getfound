export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
}

export interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  sendMessage: (content: string) => void;
  toggleChat: () => void;
  clearHistory: () => void;
}