#!/bin/bash

# Spur Chat Agent - Manual Testing Script
# This script helps test all major functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="${API_URL:-http://localhost:3001/api}"

echo "================================"
echo "Spur Chat Agent - Testing Script"
echo "================================"
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
echo "$HEALTH_RESPONSE" | jq '.'

if echo "$HEALTH_RESPONSE" | jq -e '.status == "healthy"' > /dev/null; then
    echo -e "${GREEN}✓ Health check passed${NC}\n"
else
    echo -e "${RED}✗ Health check failed${NC}\n"
    exit 1
fi

# Test 2: Send first message (create new conversation)
echo -e "${YELLOW}Test 2: Send First Message (New Conversation)${NC}"
MESSAGE_1_RESPONSE=$(curl -s -X POST "$API_URL/chat/message" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! What can you help me with?"}')

echo "$MESSAGE_1_RESPONSE" | jq '.'

SESSION_ID=$(echo "$MESSAGE_1_RESPONSE" | jq -r '.sessionId')

if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
    echo -e "${GREEN}✓ First message sent successfully${NC}"
    echo -e "Session ID: $SESSION_ID\n"
else
    echo -e "${RED}✗ Failed to send first message${NC}\n"
    exit 1
fi

# Test 3: Send follow-up message (continue conversation)
echo -e "${YELLOW}Test 3: Send Follow-up Message${NC}"
MESSAGE_2_RESPONSE=$(curl -s -X POST "$API_URL/chat/message" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"What's your return policy?\", \"sessionId\": \"$SESSION_ID\"}")

echo "$MESSAGE_2_RESPONSE" | jq '.'

if echo "$MESSAGE_2_RESPONSE" | jq -e '.reply' > /dev/null; then
    echo -e "${GREEN}✓ Follow-up message sent successfully${NC}\n"
else
    echo -e "${RED}✗ Failed to send follow-up message${NC}\n"
    exit 1
fi

# Test 4: Get conversation history
echo -e "${YELLOW}Test 4: Get Conversation History${NC}"
HISTORY_RESPONSE=$(curl -s "$API_URL/chat/history/$SESSION_ID")
echo "$HISTORY_RESPONSE" | jq '.'

MESSAGE_COUNT=$(echo "$HISTORY_RESPONSE" | jq '.messages | length')

if [ "$MESSAGE_COUNT" -ge 4 ]; then
    echo -e "${GREEN}✓ Retrieved conversation history (${MESSAGE_COUNT} messages)${NC}\n"
else
    echo -e "${RED}✗ Conversation history incomplete${NC}\n"
    exit 1
fi

# Test 5: Test FAQ knowledge - Shipping
echo -e "${YELLOW}Test 5: Test FAQ - Shipping${NC}"
SHIPPING_RESPONSE=$(curl -s -X POST "$API_URL/chat/message" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Do you offer free shipping?\", \"sessionId\": \"$SESSION_ID\"}")

SHIPPING_REPLY=$(echo "$SHIPPING_RESPONSE" | jq -r '.reply')
echo "Reply: $SHIPPING_REPLY"

if echo "$SHIPPING_REPLY" | grep -iq "shipping"; then
    echo -e "${GREEN}✓ FAQ knowledge working${NC}\n"
else
    echo -e "${YELLOW}⚠ AI response may not be accurate${NC}\n"
fi

# Test 6: Test input validation - Empty message
echo -e "${YELLOW}Test 6: Test Input Validation - Empty Message${NC}"
EMPTY_RESPONSE=$(curl -s -X POST "$API_URL/chat/message" \
  -H "Content-Type: application/json" \
  -d '{"message": ""}')

echo "$EMPTY_RESPONSE" | jq '.'

if echo "$EMPTY_RESPONSE" | jq -e '.error' > /dev/null; then
    echo -e "${GREEN}✓ Empty message validation working${NC}\n"
else
    echo -e "${RED}✗ Empty message validation failed${NC}\n"
fi

# Test 7: Test input validation - Long message
echo -e "${YELLOW}Test 7: Test Input Validation - Long Message${NC}"
LONG_MESSAGE=$(printf 'a%.0s' {1..2500})
LONG_RESPONSE=$(curl -s -X POST "$API_URL/chat/message" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$LONG_MESSAGE\"}")

echo "$LONG_RESPONSE" | jq '.'

if echo "$LONG_RESPONSE" | jq -e '.error' > /dev/null; then
    echo -e "${GREEN}✓ Long message validation working${NC}\n"
else
    echo -e "${RED}✗ Long message validation failed${NC}\n"
fi

# Test 8: Test invalid session ID
echo -e "${YELLOW}Test 8: Test Invalid Session ID${NC}"
INVALID_HISTORY=$(curl -s "$API_URL/chat/history/invalid-uuid-format")
echo "$INVALID_HISTORY" | jq '.'

if echo "$INVALID_HISTORY" | jq -e '.error' > /dev/null; then
    echo -e "${GREEN}✓ Invalid session ID handled correctly${NC}\n"
else
    echo -e "${RED}✗ Invalid session ID not handled${NC}\n"
fi

# Test 9: Test context preservation
echo -e "${YELLOW}Test 9: Test Context Preservation${NC}"
CONTEXT_1=$(curl -s -X POST "$API_URL/chat/message" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Do you ship to Canada?\", \"sessionId\": \"$SESSION_ID\"}")

CONTEXT_2=$(curl -s -X POST "$API_URL/chat/message" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"How long does it take?\", \"sessionId\": \"$SESSION_ID\"}")

CONTEXT_REPLY=$(echo "$CONTEXT_2" | jq -r '.reply')
echo "Reply: $CONTEXT_REPLY"

if echo "$CONTEXT_REPLY" | grep -iq "shipping\|deliver\|days\|Canada"; then
    echo -e "${GREEN}✓ Context preservation working${NC}\n"
else
    echo -e "${YELLOW}⚠ Context may not be preserved${NC}\n"
fi

# Summary
echo "================================"
echo -e "${GREEN}All critical tests passed!${NC}"
echo "================================"
echo ""
echo "Session ID for manual testing: $SESSION_ID"
echo ""
echo "Manual test commands:"
echo "---------------------"
echo "# Get history:"
echo "curl $API_URL/chat/history/$SESSION_ID | jq '.'"
echo ""
echo "# Send message:"
echo "curl -X POST $API_URL/chat/message \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\": \"Your message here\", \"sessionId\": \"$SESSION_ID\"}' | jq '.'"
