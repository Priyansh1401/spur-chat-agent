import { Message } from '../../models';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMServiceInterface {
  generateReply(
    conversationHistory: Message[],
    userMessage: string
  ): Promise<LLMResponse>;
}

const FAQ_KNOWLEDGE = `
SHIPPING POLICY:
- Free shipping on all orders over $50
- Standard shipping takes 3-5 business days
- Express shipping available (1-2 business days) for $15
- International shipping available to most countries (7-14 business days)
- Tracking number provided for all shipments

RETURN & REFUND POLICY:
- 30-day return window from date of delivery
- Items must be unused and in original packaging
- Free return shipping within the US
- Full refund processed within 5-7 business days after receiving return
- Exchanges available for different sizes/colors

SUPPORT HOURS:
- Live chat: Monday-Friday, 9 AM - 6 PM EST
- Email support: 24/7 (response within 24 hours)
- Phone support: Monday-Friday, 10 AM - 5 PM EST
- Phone: 1-800-SPUR-123

PAYMENT METHODS:
- All major credit cards (Visa, Mastercard, Amex, Discover)
- PayPal, Apple Pay, Google Pay
- Buy Now, Pay Later options available (Klarna, Afterpay)

PRODUCT INFORMATION:
- We sell high-quality e-commerce products
- All products come with a 1-year warranty
- Price match guarantee within 30 days of purchase
`;

export class HuggingFaceLLMService implements LLMServiceInterface {
  private apiUrl: string;
  private model: string;

  constructor() {
    this.model = 'microsoft/DialoGPT-medium';
    this.apiUrl = `https://api-inference.huggingface.co/models/${this.model}`;
  }

  private buildPrompt(conversationHistory: Message[], userMessage: string): string {
    const systemPrompt = `You are a helpful customer support agent for SpurStore. Answer questions using this information:\n\n${FAQ_KNOWLEDGE}\n\nBe friendly, concise, and helpful.\n\n`;
    
    let prompt = systemPrompt;
    
    const recentMessages = conversationHistory.slice(-6);
    for (const msg of recentMessages) {
      if (msg.sender === 'user') {
        prompt += `Customer: ${msg.text}\n`;
      } else {
        prompt += `Agent: ${msg.text}\n`;
      }
    }
    
    prompt += `Customer: ${userMessage}\nAgent:`;
    
    return prompt;
  }

  private getKeywordResponse(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return "We offer a 30-day return policy! You can return items within 30 days of delivery for a full refund. Items must be unused and in original packaging. We provide free return shipping within the US, and refunds are processed within 5-7 business days. Would you like help starting a return?";
    }
    
    if (lowerMessage.includes('ship') || lowerMessage.includes('delivery')) {
      return "We offer free shipping on orders over $50! Standard shipping takes 3-5 business days, and we also have express shipping (1-2 days) for $15. We ship internationally to most countries (7-14 business days). All orders include tracking numbers. What would you like to know about shipping?";
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return "We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, and Google Pay. We also offer Buy Now, Pay Later options through Klarna and Afterpay. Which payment method would you prefer?";
    }
    
    if (lowerMessage.includes('support') || lowerMessage.includes('contact') || lowerMessage.includes('hours')) {
      return "Our support team is available Monday-Friday, 9 AM - 6 PM EST via live chat. Email support is available 24/7 with responses within 24 hours. Phone support is Monday-Friday, 10 AM - 5 PM EST at 1-800-SPUR-123. How can I help you today?";
    }
    
    if (lowerMessage.includes('warranty') || lowerMessage.includes('guarantee')) {
      return "All our products come with a 1-year warranty! We also offer a price match guarantee within 30 days of purchase. If you find a lower price elsewhere, we'll match it. What product are you interested in?";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Welcome to SpurStore customer support. I'm here to help you with questions about shipping, returns, payments, or our products. What can I assist you with today?";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with today?";
    }
    
    return null;
  }

  async generateReply(
    conversationHistory: Message[],
    userMessage: string
  ): Promise<LLMResponse> {
    try {
      const keywordResponse = this.getKeywordResponse(userMessage);
      
      if (keywordResponse) {
        return {
          text: keywordResponse,
          model: 'keyword-matcher',
          usage: {
            inputTokens: 0,
            outputTokens: 0,
          },
        };
      }

      const prompt = this.buildPrompt(conversationHistory, userMessage);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        console.warn('Hugging Face API error, using fallback response');
        return {
          text: "I'm here to help! I can answer questions about our shipping policy, returns, payment methods, support hours, and product warranties. What would you like to know?",
          model: 'fallback',
          usage: { inputTokens: 0, outputTokens: 0 },
        };
      }

      const data = await response.json();
      
      let generatedText = '';
      const responseData = data as any;
      if (Array.isArray(responseData) && responseData[0]?.generated_text) {
      generatedText = responseData[0].generated_text.trim();
      } else if (responseData.generated_text) {
      generatedText = responseData.generated_text.trim();
      }

      if (!generatedText || generatedText.length < 10) {
        generatedText = "I'd be happy to help! Could you please provide more details about your question? I can assist with shipping, returns, payments, or any other questions about SpurStore.";
      }

      return {
        text: generatedText,
        model: this.model,
        usage: {
          inputTokens: prompt.length / 4,
          outputTokens: generatedText.length / 4,
        },
      };
    } catch (error: any) {
      console.error('LLM API Error:', error);
      
      return {
        text: "Thank you for contacting SpurStore! I'm here to help with questions about:\n\n• Shipping (free over $50, 3-5 business days)\n• Returns (30-day policy, free return shipping)\n• Payments (all major cards, PayPal, Apple Pay)\n• Support hours (Mon-Fri 9 AM - 6 PM EST)\n\nWhat can I help you with?",
        model: 'fallback',
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    }
  }
}

export function createLLMService(): LLMServiceInterface {
  return new HuggingFaceLLMService();
}