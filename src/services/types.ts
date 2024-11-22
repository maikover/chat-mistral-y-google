import { ModelType as GeminiModelType } from './gemini';
import { MistralModelType } from './mistral';

export type Provider = 'gemini' | 'mistral';
export type ModelType = { provider: Provider; model: GeminiModelType | MistralModelType };

export interface AIService {
  chat: (message: string, imageData?: string) => Promise<string>;
  setModel: (model: string) => void;
  setSystemInstructions: (instructions: string) => void;
  resetChat: () => void;
}