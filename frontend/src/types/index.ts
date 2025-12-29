export type MessageSender = 'user' | 'ai';

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
  messageId: string;
}

export interface ConversationHistoryResponse {
  conversationId: string;
  messages: Message[];
}

export interface ApiError {
  error: string;
  details?: any;
}
