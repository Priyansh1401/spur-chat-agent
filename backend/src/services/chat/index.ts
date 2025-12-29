import { ConversationModel, MessageModel } from '../../models';
import { createLLMService, LLMServiceInterface } from '../llm';

export interface SendMessageInput {
  message: string;
  sessionId?: string;
}

export interface SendMessageOutput {
  reply: string;
  sessionId: string;
  messageId: string;
}

export interface ConversationHistory {
  conversationId: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }>;
}

export class ChatService {
  private llmService: LLMServiceInterface;

  constructor() {
    this.llmService = createLLMService();
  }

  /**
   * Process a chat message and generate AI response
   */
  async sendMessage(input: SendMessageInput): Promise<SendMessageOutput> {
    // Validate input
    if (!input.message || input.message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (input.message.length > 2000) {
      throw new Error('Message is too long. Please keep it under 2000 characters.');
    }

    try {
      // Get or create conversation
      let conversationId = input.sessionId;
      
      if (conversationId) {
        // Verify conversation exists
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
          // If session ID is invalid, create new conversation
          const newConversation = await ConversationModel.create();
          conversationId = newConversation.id;
        }
      } else {
        // Create new conversation
        const newConversation = await ConversationModel.create();
        conversationId = newConversation.id;
      }

      // Save user message
      await MessageModel.create({
        conversationId,
        sender: 'user',
        text: input.message.trim(),
      });

      // Get conversation history (last 10 messages for context)
      const history = await MessageModel.findRecentByConversationId(
        conversationId,
        10
      );

      // Generate AI response
      const llmResponse = await this.llmService.generateReply(
        history,
        input.message.trim()
      );

      // Save AI response
      const aiMessage = await MessageModel.create({
        conversationId,
        sender: 'ai',
        text: llmResponse.text,
      });

      // Log usage in development
      if (process.env.NODE_ENV === 'development' && llmResponse.usage) {
        console.log('LLM Usage:', {
          model: llmResponse.model,
          inputTokens: llmResponse.usage.inputTokens,
          outputTokens: llmResponse.usage.outputTokens,
        });
      }

      return {
        reply: llmResponse.text,
        sessionId: conversationId,
        messageId: aiMessage.id,
      };
    } catch (error: any) {
      console.error('Chat service error:', error);
      
      // Return user-friendly error messages
      if (error.message.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.');
      } else if (error.message.includes('Rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.message.includes('temporarily unavailable')) {
        throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
      }
      
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(sessionId: string): Promise<ConversationHistory> {
    // Verify conversation exists
    const conversation = await ConversationModel.findById(sessionId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get all messages
    const messages = await MessageModel.findByConversationId(sessionId);

    return {
      conversationId: sessionId,
      messages: messages.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.created_at.toISOString(),
      })),
    };
  }

  /**
   * Health check for dependencies
   */
  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    const services: Record<string, boolean> = {
      database: false,
      llm: false,
    };

    try {
      // Test database
      await MessageModel.findRecentByConversationId('non-existent-id', 1);
      services.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // LLM health is assumed OK if initialization succeeded
    services.llm = true;

    const allHealthy = Object.values(services).every((v) => v);
    
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      services,
    };
  }
}
