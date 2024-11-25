export interface Message {
  text: string;
  isBot: boolean;
  imageData?: string;
  userMessage?: string;
  userImageData?: string;
}

export type Provider = 'gemini' | 'mistral' | 'groq';
export type ModelType = { provider: Provider; model: string };