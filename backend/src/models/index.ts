import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';

export type MessageSender = 'user' | 'ai';

export interface Conversation {
  id: string;
  created_at: Date;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  text: string;
  created_at: Date;
}

export interface CreateMessageInput {
  conversationId: string;
  sender: MessageSender;
  text: string;
}

export class ConversationModel {
  /**
   * Create a new conversation
   */
  static async create(metadata?: Record<string, any>): Promise<Conversation> {
    const id = uuidv4();
    const query = `
      INSERT INTO conversations (id, metadata)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await db.query<Conversation>(query, [
      id,
      metadata ? JSON.stringify(metadata) : null,
    ]);
    
    return result.rows[0];
  }

  /**
   * Find conversation by ID
   */
  static async findById(id: string): Promise<Conversation | null> {
    const query = 'SELECT * FROM conversations WHERE id = $1';
    const result = await db.query<Conversation>(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all conversations (for admin purposes)
   */
  static async findAll(limit = 100, offset = 0): Promise<Conversation[]> {
    const query = `
      SELECT * FROM conversations
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query<Conversation>(query, [limit, offset]);
    return result.rows;
  }
}

export class MessageModel {
  /**
   * Create a new message
   */
  static async create(input: CreateMessageInput): Promise<Message> {
    const id = uuidv4();
    const query = `
      INSERT INTO messages (id, conversation_id, sender, text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await db.query<Message>(query, [
      id,
      input.conversationId,
      input.sender,
      input.text,
    ]);
    
    return result.rows[0];
  }

  /**
   * Get all messages for a conversation
   */
  static async findByConversationId(conversationId: string): Promise<Message[]> {
    const query = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `;
    
    const result = await db.query<Message>(query, [conversationId]);
    return result.rows;
  }

  /**
   * Get recent messages for a conversation (for context)
   */
  static async findRecentByConversationId(
    conversationId: string,
    limit = 10
  ): Promise<Message[]> {
    const query = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await db.query<Message>(query, [conversationId, limit]);
    // Reverse to get chronological order
    return result.rows.reverse();
  }

  /**
   * Count messages in a conversation
   */
  static async countByConversationId(conversationId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE conversation_id = $1
    `;
    
    const result = await db.query<{ count: string }>(query, [conversationId]);
    return parseInt(result.rows[0].count, 10);
  }
}
