import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';
import { db } from './config/database';
import routes from './routes';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from './middleware/error.middleware';

const app: Express = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    await db.close();
    console.log('Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start listening
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Spur AI Chat Backend Server                     ║
║                                                       ║
║   Environment: ${config.nodeEnv.padEnd(40)}║
║   Port:        ${config.port.toString().padEnd(40)}║
║   LLM:         ${config.llm.provider.padEnd(40)}║
║   Model:       ${config.llm.model.padEnd(40)}║
║                                                       ║
║   Ready to handle chat requests! 💬                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
