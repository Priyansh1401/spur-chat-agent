import {
  SendMessageRequest,
  SendMessageResponse,
  ConversationHistoryResponse,
  ApiError,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/api`;
  }

  /**
   * Send a chat message
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await fetch(`${this.baseUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  }

  /**
   * Get conversation history
   */
  async getHistory(sessionId: string): Promise<ConversationHistoryResponse> {
    const response = await fetch(
      `${this.baseUrl}/chat/history/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to fetch history');
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

export const apiClient = new ApiClient();
