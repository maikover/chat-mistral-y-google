import MistralClient from '@mistralai/mistralai';

export type MistralModelType = 'mistral-tiny' | 'mistral-small' | 'mistral-medium';

export class MistralService {
  private static instance: MistralService;
  private client: MistralClient | null = null;
  private currentModel: MistralModelType = 'mistral-small';
  private systemInstructions: string = '';
  private chatHistory: { role: string; content: string }[] = [];

  private initialize() {
    const API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
    if (!API_KEY) {
      return false;
    }
    this.client = new MistralClient(API_KEY);
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

  setModel(model: MistralModelType) {
    this.currentModel = model;
    this.resetChat();
  }

  setSystemInstructions(instructions: string) {
    this.systemInstructions = instructions;
    this.resetChat();
  }

  async chat(message: string) {
    if (!this.client && !this.initialize()) {
      throw new Error('Please configure your Mistral API key in the .env file');
    }

    try {
      this.chatHistory.push({
        role: "user",
        content: message
      });

      const response = await this.client!.chat({
        model: this.currentModel,
        messages: this.chatHistory,
      });

      const responseText = response.choices[0].message.content;

      this.chatHistory.push({
        role: "assistant",
        content: responseText
      });

      return responseText;
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      throw new Error('Failed to get response from Mistral');
    }
  }

  static getInstance(): MistralService {
    if (!MistralService.instance) {
      MistralService.instance = new MistralService();
    }
    return MistralService.instance;
  }
}

export const mistralService = MistralService.getInstance();