import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    url?: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  llm: {
    provider: 'anthropic' | 'openai';
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  cors: {
    origin: string;
  };
}

const getConfig = (): Config => {
  // Validate required env vars
  const requiredVars = ['ANTHROPIC_API_KEY'];
  const missing = requiredVars.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'spur_chat',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    },
    llm: {
      provider: (process.env.LLM_PROVIDER as 'anthropic' | 'openai') || 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '1024', 10),
    },
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
  };
};

export const config = getConfig();
