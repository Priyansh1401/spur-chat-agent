# API Documentation

Complete API reference for the Spur AI Chat Agent backend.

## Base URL

```
Local: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Endpoints

### Health Check

Check if the API and its dependencies are healthy.

**GET** `/health`

**Response 200 (Healthy)**
```json
{
  "status": "healthy",
  "services": {
    "database": true,
    "llm": true
  }
}
```

**Response 503 (Degraded)**
```json
{
  "status": "degraded",
  "services": {
    "database": false,
    "llm": true
  }
}
```

---

### Send Message

Send a chat message and receive an AI-generated response.

**POST** `/chat/message`

**Request Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid-for-existing-conversation"
}
```

**Request Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's message (1-2000 characters) |
| sessionId | string (UUID) | No | Existing conversation ID to continue |

**Response 200 (Success)**
```json
{
  "reply": "Our return policy allows you to return items within 30 days...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messageId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| reply | string | AI-generated response |
| sessionId | string (UUID) | Conversation ID (new or existing) |
| messageId | string (UUID) | ID of the AI message |

**Response 400 (Validation Error)**
```json
{
  "error": "Invalid request",
  "details": [
    {
      "field": "message",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

**Response 429 (Rate Limit)**
```json
{
  "error": "Too many requests. Please wait a moment and try again."
}
```

**Response 503 (Service Unavailable)**
```json
{
  "error": "AI service is temporarily unavailable. Please try again in a moment."
}
```

**Error Codes**
- `400` - Invalid input (empty message, too long, invalid UUID)
- `429` - Rate limit exceeded
- `500` - Internal server error
- `503` - LLM service unavailable

**cURL Example**
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your shipping options?",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

### Get Conversation History

Retrieve all messages from a conversation.

**GET** `/chat/history/:sessionId`

**URL Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string (UUID) | Yes | Conversation ID |

**Response 200 (Success)**
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "sender": "user",
      "text": "Hello",
      "timestamp": "2025-01-01T12:00:00.000Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "sender": "ai",
      "text": "Hi! How can I help you today?",
      "timestamp": "2025-01-01T12:00:01.000Z"
    }
  ]
}
```

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| conversationId | string (UUID) | The conversation ID |
| messages | array | Array of message objects |
| messages[].id | string (UUID) | Message ID |
| messages[].sender | string | "user" or "ai" |
| messages[].text | string | Message content |
| messages[].timestamp | string (ISO 8601) | When message was created |

**Response 400 (Invalid UUID)**
```json
{
  "error": "Invalid session ID format"
}
```

**Response 404 (Not Found)**
```json
{
  "error": "Conversation not found"
}
```

**cURL Example**
```bash
curl http://localhost:3001/api/chat/history/550e8400-e29b-41d4-a716-446655440000
```

---

## Data Models

### Conversation
```typescript
{
  id: string;              // UUID
  created_at: Date;        // Timestamp with timezone
  metadata?: object;       // Optional JSON metadata
}
```

### Message
```typescript
{
  id: string;              // UUID
  conversation_id: string; // Foreign key to conversation
  sender: 'user' | 'ai';  // Message sender
  text: string;            // Message content
  created_at: Date;        // Timestamp with timezone
}
```

---

## Error Handling

All endpoints use consistent error response format:

```json
{
  "error": "Human-readable error message"
}
```

For validation errors:
```json
{
  "error": "Invalid request",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

### Common Error Messages

| Error | Meaning | Action |
|-------|---------|--------|
| "Message cannot be empty" | Empty message sent | Send non-empty message |
| "Message is too long" | Message > 2000 chars | Shorten message |
| "Invalid session ID format" | Malformed UUID | Use valid UUID or omit |
| "Conversation not found" | Session doesn't exist | Create new conversation |
| "Rate limit exceeded" | Too many requests | Wait before retrying |
| "AI service temporarily unavailable" | LLM API error | Retry in a moment |

---

## Rate Limiting

Currently not enforced but recommended for production:

- **Per IP**: 100 requests per hour
- **Per Session**: 50 messages per conversation per hour
- **Burst**: 10 requests per minute

Implementation ready but commented out in code.

---

## Authentication

Currently not implemented. All endpoints are public.

For production, consider adding:
- API key authentication
- JWT tokens for user sessions
- OAuth for third-party integrations

---

## Versioning

Current version: `v1` (implicit)

Future versions will use URL path: `/api/v2/...`

---

## WebSocket Support

Not currently implemented.

For real-time updates, consider:
- Socket.io for bi-directional communication
- Server-Sent Events (SSE) for server-to-client updates
- WebSocket for streaming responses

---

## Client Libraries

### JavaScript/TypeScript

```typescript
class ChatClient {
  constructor(private baseUrl: string) {}

  async sendMessage(message: string, sessionId?: string) {
    const response = await fetch(`${this.baseUrl}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return response.json();
  }

  async getHistory(sessionId: string) {
    const response = await fetch(
      `${this.baseUrl}/chat/history/${sessionId}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return response.json();
  }
}

// Usage
const client = new ChatClient('http://localhost:3001/api');
const result = await client.sendMessage('Hello!');
```

### Python

```python
import requests

class ChatClient:
    def __init__(self, base_url: str):
        self.base_url = f"{base_url}/api"
    
    def send_message(self, message: str, session_id: str = None):
        payload = {"message": message}
        if session_id:
            payload["sessionId"] = session_id
        
        response = requests.post(
            f"{self.base_url}/chat/message",
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def get_history(self, session_id: str):
        response = requests.get(
            f"{self.base_url}/chat/history/{session_id}"
        )
        response.raise_for_status()
        return response.json()

# Usage
client = ChatClient('http://localhost:3001')
result = client.send_message('Hello!')
```

---

## Testing

### Unit Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
cd backend
npm run test:integration
```

### Manual Testing with cURL

```bash
# 1. Send first message (creates new conversation)
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'

# 2. Send follow-up (use sessionId from response)
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your shipping options?",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'

# 3. Get conversation history
curl http://localhost:3001/api/chat/history/550e8400-e29b-41d4-a716-446655440000
```

---

## Performance Considerations

### Response Times
- **Average**: 1-3 seconds (includes LLM API call)
- **P95**: 5 seconds
- **P99**: 10 seconds

### Optimization Tips
1. Use connection pooling (already implemented)
2. Cache conversation history in Redis
3. Implement streaming responses for faster perceived performance
4. Add CDN for frontend assets
5. Use database read replicas for high traffic

### Scaling
- Backend is stateless and horizontally scalable
- Database connection pool can handle 20 concurrent connections
- Consider message queue for async processing at scale

---

## Support

For API-related issues:
1. Check `/health` endpoint
2. Review server logs
3. Verify environment variables
4. Test with cURL before debugging client code
5. Open GitHub issue with API request/response details
