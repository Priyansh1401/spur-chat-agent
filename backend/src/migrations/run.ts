/**
 * Migration runner
 * This script runs all migrations in order
 */

// Import all migrations
import './001_initial_schema';

// The migration files will execute themselves
console.log('Running migrations...');
