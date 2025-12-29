import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../../types';
import { apiClient } from '../../services/api';
import './Chat.css';

const SESSION_STORAGE_KEY = 'spur_chat_session_id';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      
      if (storedSessionId) {
        try {
          const history = await apiClient.getHistory(storedSessionId);
          setMessages(history.messages);
          setSessionId(storedSessionId);
        } catch (err) {
          console.error('Failed to load session:', err);
          // If session is invalid, clear it
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    };

    loadSession();
  }, []);

  // Save session to localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
  }, [sessionId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = inputValue.trim();
    
    if (!trimmedMessage || isLoading) {
      return;
    }

    // Clear error
    setError(null);

    // Optimistically add user message
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: trimmedMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await apiClient.sendMessage({
        message: trimmedMessage,
        sessionId: sessionId || undefined,
      });

      // Update session ID if this is a new conversation
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      // Add AI response
      const aiMessage: Message = {
        id: response.messageId,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Send message error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h1>SpurStore Support</h1>
          <p>Ask us anything about our products and policies</p>
        </div>
        {messages.length > 0 && (
          <button
            className="new-chat-button"
            onClick={startNewConversation}
            title="Start new conversation"
          >
            + New Chat
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">💬</div>
            <h2>Welcome to SpurStore Support!</h2>
            <p>How can we help you today?</p>
            <div className="suggested-questions">
              <button
                className="suggestion"
                onClick={() => setInputValue("What's your return policy?")}
              >
                What's your return policy?
              </button>
              <button
                className="suggestion"
                onClick={() => setInputValue('Do you ship internationally?')}
              >
                Do you ship internationally?
              </button>
              <button
                className="suggestion"
                onClick={() => setInputValue('What payment methods do you accept?')}
              >
                What payment methods do you accept?
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-avatar">
              {message.sender === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message ai-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          maxLength={2000}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
};
