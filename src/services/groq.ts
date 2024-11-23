import Groq from 'groq-sdk';

export type GroqModelType = 
  | 'mixtral-8x7b-32768' 
  | 'gemma-7b-it'
  | 'llama2-70b-4096';

export class GroqService {
  private static instance: GroqService;
  private client: Groq | null = null;
  private currentModel: GroqModelType = 'mixtral-8x7b-32768';
  private systemInstructions: string = '';
  private chatHistory: { role: string; content: string }[] = [];

  private initialize() {
    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!API_KEY) {
      return false;
    }
    this.client = new Groq({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true
    });
    return true;
  }

  resetChat() {
    this.chatHistory = [];
    if (this.systemInstructions) {
      this.chatHistory.push({
        role: "system",
        content: this.systemInstructions
      });
    }
  }

  setModel(model: GroqModelType) {
    this.currentModel = model;
    this.resetChat();
  }

  setSystemInstructions(instructions: string) {
    this.systemInstructions = instructions;
    this.resetChat();
  }

  async chat(message: string) {
    if (!this.client && !this.initialize()) {
      throw new Error('Please configure your GROQ API key in the .env file');
    }

    try {
      this.chatHistory.push({
        role: "user",
        content: message
      });

      const completion = await this.client!.chat.completions.create({
        messages: this.chatHistory,
        model: this.currentModel,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        stream: false,
      });

      const responseText = completion.choices[0]?.message?.content || '';

      this.chatHistory.push({
        role: "assistant",
        content: responseText
      });

      return responseText;
    } catch (error) {
      console.error('Error calling GROQ API:', error);
      throw new Error('Failed to get response from GROQ');
    }
  }

  static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }
}

export const groqService = GroqService.getInstance();