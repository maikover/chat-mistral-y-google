import { ModelType as GeminiModelType } from './gemini';
import { MistralModelType } from './mistral';
import { GroqModelType } from './groq';

export type Provider = 'gemini' | 'mistral' | 'groq';
export type ModelType = { provider: Provider; model: GeminiModelType | MistralModelType | GroqModelType };

export interface AIService {
  chat: (message: string, imageData?: string) => Promise<string>;
  setModel: (model: string) => void;
  setSystemInstructions: (instructions: string) => void;
  resetChat: () => void;
}