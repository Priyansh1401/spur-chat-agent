# Quick Start Guide

Get the Spur AI Chat Agent running locally in under 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd spur-chat-agent
```

### 2. Set Up Database
```bash
# Create database
createdb spur_chat

# Or using psql
psql -U postgres
CREATE DATABASE spur_chat;
\q
```

### 3. Configure Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
# Required: Set ANTHROPIC_API_KEY
nano .env
```

**Minimum .env configuration:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/spur_chat
ANTHROPIC_API_KEY=your_key_here
```

### 4. Run Database Migrations
```bash
npm run migrate
```

You should see:
```
✅ Created conversations table
✅ Created messages table
✅ Created indexes
✨ Migration completed successfully!
```

### 5. Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ Database connection established
🚀 Spur AI Chat Backend Server
   Ready to handle chat requests! 💬
```

### 6. Configure Frontend
```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Default settings work for local development
```

### 7. Start Frontend
```bash
npm run dev
```

Your browser should automatically open to http://localhost:5173

## Test It Out!

1. Type a message: "What's your return policy?"
2. Watch the AI respond
3. Try more questions about shipping, payments, etc.
4. Refresh the page - your conversation should persist!

## Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check database exists: `psql -l`

### "Invalid API key"
- Verify ANTHROPIC_API_KEY in backend/.env
- Check key at https://console.anthropic.com/

### "Cannot connect to backend"
- Check backend is running on port 3001
- Verify VITE_API_URL in frontend/.env
- Check for CORS errors in browser console

### Port already in use
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in backend/.env
PORT=3002
```

## What's Next?

- Read the full [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Explore the code to understand the architecture
- Customize the FAQ knowledge base in `backend/src/services/llm/index.ts`

## Common Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run migrate      # Run database migrations

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Need Help?

- Check the logs in your terminal
- Review error messages in browser console
- Read the detailed README.md
- Open an issue on GitHub

Happy coding! 🚀
