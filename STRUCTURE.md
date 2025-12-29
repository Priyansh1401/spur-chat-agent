# Project Structure

Complete file tree and organization of the Spur AI Chat Agent.

```
spur-chat-agent/
├── README.md                      # Main documentation
├── QUICKSTART.md                  # Quick start guide
├── DEPLOYMENT.md                  # Deployment instructions
├── API.md                         # API documentation
├── docker-compose.yml             # Docker compose configuration
├── test-api.sh                    # API testing script
├── .gitignore                     # Root gitignore
│
├── backend/                       # Backend Node.js application
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   │   ├── index.ts          # Environment config loader
│   │   │   └── database.ts       # Database connection pool
│   │   │
│   │   ├── models/               # Database models
│   │   │   └── index.ts          # Conversation & Message models
│   │   │
│   │   ├── services/             # Business logic layer
│   │   │   ├── llm/              # LLM integration
│   │   │   │   └── index.ts      # Anthropic Claude service
│   │   │   └── chat/             # Chat logic
│   │   │       └── index.ts      # Chat service
│   │   │
│   │   ├── controllers/          # HTTP request handlers
│   │   │   └── chat.controller.ts # Chat endpoints controller
│   │   │
│   │   ├── routes/               # API routes
│   │   │   └── index.ts          # Route definitions
│   │   │
│   │   ├── middleware/           # Express middleware
│   │   │   └── error.middleware.ts # Error handling
│   │   │
│   │   ├── migrations/           # Database migrations
│   │   │   ├── 001_initial_schema.ts # Initial DB schema
│   │   │   └── run.ts            # Migration runner
│   │   │
│   │   └── server.ts             # Application entry point
│   │
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── .env.example              # Environment template
│   ├── .gitignore                # Backend gitignore
│   ├── Dockerfile                # Backend Docker image
│   └── .dockerignore             # Docker ignore rules
│
├── frontend/                      # Frontend React application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   └── Chat/             # Chat component
│   │   │       ├── Chat.tsx      # Main chat UI
│   │   │       └── Chat.css      # Chat styles
│   │   │
│   │   ├── services/             # API client
│   │   │   └── api.ts            # Backend API client
│   │   │
│   │   ├── types/                # TypeScript types
│   │   │   └── index.ts          # Shared type definitions
│   │   │
│   │   ├── App.tsx               # Root component
│   │   ├── App.css               # Global styles
│   │   └── main.tsx              # Application entry point
│   │
│   ├── public/                   # Static assets
│   ├── index.html                # HTML template
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── tsconfig.node.json        # Node TypeScript config
│   ├── vite.config.ts            # Vite configuration
│   ├── .env.example              # Environment template
│   ├── .gitignore                # Frontend gitignore
│   ├── Dockerfile                # Frontend Docker image
│   ├── nginx.conf                # Nginx configuration
│   └── .dockerignore             # Docker ignore rules
│
└── node_modules/                 # Dependencies (gitignored)
```

## Directory Purposes

### Backend Structure

#### `/src/config/`
Configuration management and database connection.
- `index.ts`: Loads and validates environment variables
- `database.ts`: PostgreSQL connection pool setup

#### `/src/models/`
Database models and data access layer.
- Defines TypeScript interfaces for database entities
- Provides CRUD operations for conversations and messages
- Uses parameterized queries to prevent SQL injection

#### `/src/services/`
Business logic layer, separated from controllers.

**`/services/llm/`**
- LLM provider abstraction
- Anthropic Claude API integration
- Prompt engineering and FAQ knowledge base
- Error handling for API failures

**`/services/chat/`**
- Core chat functionality
- Message processing and validation
- Conversation management
- Integration between models and LLM service

#### `/src/controllers/`
HTTP request/response handlers.
- Input validation using Zod
- Error responses with appropriate status codes
- Thin layer that delegates to services

#### `/src/routes/`
Express route definitions.
- Maps URLs to controller methods
- Centralizes all API endpoints

#### `/src/middleware/`
Express middleware functions.
- Error handling
- Request logging
- CORS configuration (in server.ts)

#### `/src/migrations/`
Database schema management.
- SQL migrations for schema changes
- Run migrations before server starts
- Idempotent operations (safe to run multiple times)

### Frontend Structure

#### `/src/components/Chat/`
Main chat interface component.
- Message display with user/AI distinction
- Auto-scrolling behavior
- Typing indicators
- Error handling and display
- Session persistence via localStorage

#### `/src/services/`
API integration layer.
- REST client for backend communication
- Type-safe request/response handling
- Error propagation to UI

#### `/src/types/`
Shared TypeScript type definitions.
- Ensures type safety across frontend
- Matches backend API contracts

## Key Design Patterns

### Backend

**Layered Architecture**
```
Routes → Controllers → Services → Models → Database
```

**Separation of Concerns**
- Routes: URL mapping only
- Controllers: HTTP handling, validation
- Services: Business logic
- Models: Data access

**Dependency Injection**
- Services don't depend on Express
- Easy to test in isolation
- Can swap implementations (e.g., different LLM providers)

**Error Handling**
- Try-catch in controllers
- Service-level error messages
- Middleware catches unhandled errors
- User-friendly error responses

### Frontend

**Component-Based Architecture**
- Reusable Chat component
- Separation of UI and logic
- Local state management with hooks

**Service Layer**
- API calls abstracted from components
- Consistent error handling
- Easy to mock for testing

**Type Safety**
- TypeScript throughout
- Shared types between components and services
- Compile-time error detection

## File Naming Conventions

### Backend
- `*.ts` - TypeScript source files
- `*.controller.ts` - HTTP controllers
- `*.middleware.ts` - Express middleware
- `index.ts` - Main export from directory

### Frontend
- `*.tsx` - React components with JSX
- `*.ts` - Pure TypeScript (no JSX)
- `*.css` - Component styles
- `PascalCase` for components (Chat.tsx)
- `camelCase` for utilities (api.ts)

## Configuration Files

### Backend
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Dependencies and scripts
- `.env` - Environment variables (not committed)
- `.env.example` - Template for required variables

### Frontend
- `tsconfig.json` - TypeScript for source code
- `tsconfig.node.json` - TypeScript for build tools
- `vite.config.ts` - Vite build configuration
- `package.json` - Dependencies and scripts

## Scripts Reference

### Backend
```bash
npm run dev      # Development with auto-reload
npm run build    # Compile TypeScript
npm start        # Run compiled code
npm run migrate  # Run database migrations
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Environment Variables

### Backend Required
- `DATABASE_URL` or `DB_*` - Database connection
- `ANTHROPIC_API_KEY` - Claude API key

### Backend Optional
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `LLM_PROVIDER` - LLM provider (default: anthropic)
- `LLM_MODEL` - Model name
- `LLM_MAX_TOKENS` - Response length limit
- `FRONTEND_URL` - CORS allowed origin

### Frontend Required
- `VITE_API_URL` - Backend API URL

## Adding New Features

### New API Endpoint
1. Add route in `routes/index.ts`
2. Create controller method in `controllers/`
3. Implement service logic in `services/`
4. Add model methods if needed in `models/`
5. Update API.md documentation

### New LLM Provider
1. Implement `LLMServiceInterface` in `services/llm/`
2. Update `createLLMService()` factory
3. Add configuration in `config/index.ts`
4. Document in README.md

### New UI Component
1. Create component in `components/`
2. Create corresponding CSS file
3. Add types in `types/index.ts` if needed
4. Import and use in `App.tsx` or parent component

## Testing Strategy

### Unit Tests (Future)
- Services: Test business logic in isolation
- Models: Test database operations with test DB
- Controllers: Test request/response handling

### Integration Tests (Future)
- API endpoints end-to-end
- Database interactions
- LLM integration (with mocked API)

### Manual Testing
- Use `test-api.sh` script
- Test UI in browser
- Check error cases
- Verify session persistence

## Performance Considerations

### Backend
- Database connection pooling (20 connections)
- Indexed queries on conversation_id and created_at
- Efficient message history retrieval (last N messages)
- Stateless design for horizontal scaling

### Frontend
- React memoization for expensive operations
- Debounced input for search/filter (if added)
- Virtualized lists for long conversations (if needed)
- Lazy loading for heavy components

## Security Considerations

### Backend
- Parameterized SQL queries (SQL injection prevention)
- Input validation with Zod
- Environment variable secrets
- CORS configuration
- Error messages don't leak sensitive info

### Frontend
- React auto-escapes content (XSS prevention)
- HTTPS in production
- localStorage for session ID only
- No sensitive data in client storage

## Monitoring & Logging

### Current Implementation
- Console logging for development
- Request/response logging
- Database query logging
- Error stack traces (development only)

### Production Recommendations
- Structured logging (Winston/Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic/DataDog)
- Log aggregation (CloudWatch/Papertrail)

## Future Enhancements

See README.md "If I Had More Time" section for:
- WebSocket support
- Redis caching
- Rate limiting
- Admin dashboard
- Advanced RAG
- Multi-channel support
- Analytics and monitoring
