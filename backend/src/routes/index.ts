import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const chatController = new ChatController();

// Chat endpoints
router.post('/chat/message', chatController.sendMessage);
router.get('/chat/history/:sessionId', chatController.getHistory);

// Health check
router.get('/health', chatController.healthCheck);

export default router;
