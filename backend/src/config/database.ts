import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config';

class Database {
  private pool: Pool;

  constructor() {
    // Use DATABASE_URL if available, otherwise construct from individual params
    const connectionConfig = config.database.url
      ? { connectionString: config.database.url }
      : {
          host: config.database.host,
          port: config.database.port,
          database: config.database.name,
          user: config.database.user,
          password: config.database.password,
        };

    this.pool = new Pool({
      ...connectionConfig,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  /**
   * Execute a query with parameters
   */
  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      if (config.nodeEnv === 'development') {
        console.log('Executed query', { text, duration, rows: result.rowCount });
      }
      
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT NOW()');
      console.log('✅ Database connection established');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const db = new Database();
