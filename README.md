# Spur AI Live Chat Agent

A full-stack AI-powered customer support chat application built with Node.js, TypeScript, React, and PostgreSQL.

## 🏗️ Architecture Overview

### Backend Structure
```
backend/
├── src/
│   ├── config/          # Configuration (DB, env)
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic layer
│   │   ├── llm/        # LLM integration (Claude API)
│   │   └── chat/       # Chat logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   └── server.ts        # Entry point
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/      # React components
│   │   └── Chat/       # Chat UI components
│   ├── services/        # API client
│   └── App.tsx          # Main app component
```

### Database Schema
```sql
conversations (
  id: UUID (PK)
  created_at: TIMESTAMP
  metadata: JSONB
)

messages (
  id: UUID (PK)
  conversation_id: UUID (FK)
  sender: ENUM('user', 'ai')
  text: TEXT
  created_at: TIMESTAMP
)
```

### Key Design Decisions

1. **Layered Architecture**: Clean separation between routes → controllers → services → models
2. **LLM Service Abstraction**: `LLMService` interface allows easy swapping of providers
3. **Conversation Management**: Session-based approach with UUID for tracking
4. **Error Handling**: Comprehensive try-catch with graceful degradation
5. **FAQ Knowledge**: Stored in system prompt, easily extensible to DB-backed approach

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Anthropic API key (get one at https://console.anthropic.com/)

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd spur-chat-agent

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb spur_chat

# Or using psql
psql -U postgres
CREATE DATABASE spur_chat;
\q

# Run migrations
cd backend
npm run migrate
```

### 3. Environment Configuration

Create `backend/.env`:
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/spur_chat

# Or individual connection params
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spur_chat
DB_USER=postgres
DB_PASSWORD=your_password

# LLM Provider
ANTHROPIC_API_KEY=your_anthropic_api_key_here
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-20250514
LLM_MAX_TOKENS=1024

# CORS (optional)
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 4. Run the Application

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 📡 API Endpoints

### POST `/api/chat/message`
Send a chat message and get AI response.

**Request:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid-here"
}
```

**Response:**
```json
{
  "reply": "Our return policy allows...",
  "sessionId": "uuid-of-conversation",
  "messageId": "uuid-of-message"
}
```

### GET `/api/chat/history/:sessionId`
Retrieve conversation history.

**Response:**
```json
{
  "conversationId": "uuid",
  "messages": [
    {
      "id": "uuid",
      "sender": "user",
      "text": "Hello",
      "timestamp": "2025-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "sender": "ai",
      "text": "Hi! How can I help you?",
      "timestamp": "2025-01-01T00:00:01Z"
    }
  ]
}
```

## 🤖 LLM Integration

### Provider: Anthropic Claude

Using Claude Sonnet 4 for:
- Fast, cost-effective responses
- Strong instruction following
- Good at customer support tone

### Prompting Strategy

**System Prompt:**
```
You are a helpful customer support agent for SpurStore, an e-commerce platform.
Answer questions clearly, concisely, and professionally.
```

**Context Inclusion:**
- FAQ knowledge (shipping, returns, support hours)
- Recent conversation history (last 10 messages)
- User's current message

**Guardrails:**
- Input validation (1-2000 characters)
- Rate limiting (ready to add)
- Error handling for API failures
- Token limits to control costs

### FAQ Knowledge Base

The agent knows about:
- **Shipping**: Free on orders $50+, 3-5 business days, international available
- **Returns**: 30-day window, free return shipping, full refund
- **Support Hours**: Monday-Friday 9 AM - 6 PM EST, email 24/7
- **Payment**: All major cards, PayPal, Apple Pay

## 🛡️ Robustness Features

### Input Validation
- ✅ Empty message rejection
- ✅ Message length limits (1-2000 chars)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React auto-escaping)

### Error Handling
- ✅ LLM API failures → Friendly error message
- ✅ Database connection issues → 500 with retry suggestion
- ✅ Invalid session IDs → Create new conversation
- ✅ Network timeouts → User-facing error
- ✅ Rate limiting ready (commented code included)

### UX Features
- ✅ Auto-scroll to latest message
- ✅ Disabled send button during API call
- ✅ "AI is typing..." indicator
- ✅ Enter key to send
- ✅ Empty input prevention
- ✅ Error toast notifications
- ✅ Session persistence via localStorage

## 🧪 Testing the Application

### Manual Test Scenarios

1. **Basic Chat Flow**
   ```
   User: "Hello"
   AI: Should greet warmly
   
   User: "What's your return policy?"
   AI: Should explain 30-day return policy
   ```

2. **Context Preservation**
   ```
   User: "Do you ship internationally?"
   AI: "Yes, we ship to most countries..."
   
   User: "How long does it take?"
   AI: Should reference international shipping (context aware)
   ```

3. **Error Handling**
   ```
   - Try sending empty message (should be blocked)
   - Try 3000 character message (should be rejected)
   - Stop backend and send message (should show error)
   ```

4. **Session Persistence**
   ```
   - Chat with agent
   - Refresh page
   - History should reload automatically
   ```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `ANTHROPIC_API_KEY` | Claude API key | Required |
| `LLM_MODEL` | Claude model to use | claude-sonnet-4-20250514 |
| `LLM_MAX_TOKENS` | Max tokens per response | 1024 |
| `FRONTEND_URL` | CORS allowed origin | http://localhost:5173 |

## 📦 Deployment

### Backend (Render / Railway)

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables
6. Add PostgreSQL database addon

### Frontend (Vercel / Netlify)

1. Create new site from GitHub
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variable: `VITE_API_URL=your-backend-url`

### Database Migration on Deploy

```bash
# On first deploy
npm run migrate

# Or set up automatic migrations in build step
```

## 🚀 If I Had More Time...

### Features
- [ ] **Multi-channel support**: Abstract chat interface to support WhatsApp, Instagram DMs
- [ ] **Admin dashboard**: View all conversations, analytics, AI performance metrics
- [ ] **Advanced RAG**: Vector database for FAQ search, semantic similarity matching
- [ ] **User authentication**: Allow customers to resume conversations across devices
- [ ] **Handoff to human**: Detect when AI should escalate to human agent
- [ ] **Sentiment analysis**: Track customer satisfaction in real-time
- [ ] **A/B testing**: Different prompts/models for performance optimization

### Technical Improvements
- [ ] **Redis caching**: Cache conversation history, reduce DB load
- [ ] **Rate limiting**: Per-IP or per-session limits with Redis
- [ ] **WebSocket support**: Real-time updates without polling
- [ ] **Message queue**: Async processing for LLM calls (Bull/BullMQ)
- [ ] **Horizontal scaling**: Stateless design ready, add load balancer
- [ ] **Monitoring**: Add Sentry, DataDog, or similar for error tracking
- [ ] **Testing**: Unit tests (Jest), integration tests (Supertest), E2E (Playwright)
- [ ] **CI/CD**: GitHub Actions for automated testing and deployment
- [ ] **Docker**: Containerization for consistent environments

### Code Quality
- [ ] **OpenAPI/Swagger**: Auto-generated API documentation
- [ ] **Database migrations**: More robust with rollback support (TypeORM/Prisma)
- [ ] **Input sanitization**: Additional security layer with DOMPurify
- [ ] **Logging**: Structured logging with Winston or Pino
- [ ] **Type safety**: End-to-end type safety with tRPC or GraphQL

### UX Enhancements
- [ ] **Rich message types**: Images, files, buttons, carousels
- [ ] **Suggested responses**: Quick reply buttons for common questions
- [ ] **Live typing indicators**: Show when user is typing
- [ ] **Read receipts**: Show when AI has "seen" message
- [ ] **Conversation ratings**: Thumbs up/down for AI responses
- [ ] **Mobile optimization**: Better mobile chat UX
- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 🤝 Contributing

This is a take-home assignment, but the structure is designed to be production-ready and extensible.

## 📄 License

MIT

## 🙋 Support

For questions about this implementation, please contact the developer or open an issue on GitHub.
