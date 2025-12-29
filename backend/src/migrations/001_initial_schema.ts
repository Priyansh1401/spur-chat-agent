import { db } from '../config/database';

/**
 * Database migration to create initial schema
 */
async function migrate() {
  try {
    console.log('Starting database migration...');

    // Create conversations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      )
    `);
    console.log('✅ Created conversations table');

    // Create messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
        text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created messages table');

    // Create indexes for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
      ON messages(conversation_id)
    `);
    console.log('✅ Created index on messages.conversation_id');

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at 
      ON messages(created_at)
    `);
    console.log('✅ Created index on messages.created_at');

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_created_at 
      ON conversations(created_at)
    `);
    console.log('✅ Created index on conversations.created_at');

    console.log('\n✨ Migration completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
