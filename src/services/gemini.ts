import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export type ModelType = 'gemini-1.5-pro' | 'gemini-1.5-flash';

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private currentModel: ModelType = 'gemini-1.5-pro';
  private systemInstructions: string = '';
  private chatHistory: { role: string; parts: string | { text: string } | { inlineData: { data: string; mimeType: string } } }[] = [];

  private initialize() {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      return false;
    }
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: this.currentModel });
    return true;
  }

  resetChat() {
    this.chatHistory = [];
    if (this.systemInstructions) {
      this.chatHistory.push({
        role: "user",
        parts: this.systemInstructions
      });
    }
  }

  setModel(model: ModelType) {
    this.currentModel = model;
    if (this.genAI) {
      this.model = this.genAI.getGenerativeModel({ model });
      this.resetChat();
    }
  }

  setSystemInstructions(instructions: string) {
    this.systemInstructions = instructions;
    this.resetChat();
  }

  async chat(message: string, imageData?: string) {
    if (!this.model && !this.initialize()) {
      throw new Error('Please configure your Gemini API key in the .env file');
    }

    try {
      const parts: any[] = [];

      if (imageData) {
        parts.push({
          inlineData: {
            data: imageData.split(',')[1],
            mimeType: 'image/jpeg',
          }
        });
      }

      parts.push({ text: message });

      // Add user message to history
      this.chatHistory.push({
        role: "user",
        parts: parts.length === 1 ? parts[0] : parts
      });

      const result = await this.model!.generateContent(this.chatHistory.map(msg => msg.parts));
      const response = await result.response;
      const responseText = response.text();

      // Add bot response to history
      this.chatHistory.push({
        role: "model",
        parts: { text: responseText }
      });

      return responseText;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to get response from Gemini');
    }
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }
}

export const geminiService = GeminiService.getInstance();