import { Request, Response } from 'express';
import { ChatService } from '../services/chat';
import { z } from 'zod';

// Request validation schemas
const sendMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid().optional(),
});

const getHistorySchema = z.object({
  sessionId: z.string().uuid(),
});

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * POST /api/chat/message
   * Send a message and get AI response
   */
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validationResult = sendMessageSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid request',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const { message, sessionId } = validationResult.data;

      // Process message
      const result = await this.chatService.sendMessage({
        message,
        sessionId,
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Send message error:', error);
      
      // Return appropriate error response
      if (error.message.includes('empty')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('too long')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('Rate limit')) {
        res.status(429).json({ error: error.message });
      } else if (error.message.includes('temporarily unavailable')) {
        res.status(503).json({ error: error.message });
      } else {
        res.status(500).json({
          error: 'Failed to process message. Please try again.',
        });
      }
    }
  };

  /**
   * GET /api/chat/history/:sessionId
   * Get conversation history
   */
  getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate session ID
      const validationResult = getHistorySchema.safeParse({
        sessionId: req.params.sessionId,
      });

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid session ID format',
        });
        return;
      }

      const { sessionId } = validationResult.data;

      // Get history
      const history = await this.chatService.getConversationHistory(sessionId);

      res.status(200).json(history);
    } catch (error: any) {
      console.error('Get history error:', error);
      
      if (error.message.includes('not found')) {
        res.status(404).json({ error: 'Conversation not found' });
      } else {
        res.status(500).json({
          error: 'Failed to retrieve conversation history',
        });
      }
    }
  };

  /**
   * GET /api/health
   * Health check endpoint
   */
  healthCheck = async (_req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.chatService.healthCheck();
      
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
      });
    }
  };
}
