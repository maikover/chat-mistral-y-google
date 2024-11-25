import { Message } from '../types';

const STORAGE_KEY_PREFIX = 'chat_';
const CONVERSATIONS_KEY = 'conversations';
const GLOBAL_INSTRUCTIONS_KEY = 'global_instructions';
const MAX_MESSAGES = 100;

export interface Conversation {
  id: string;
  title: string;
  lastModified: number;
  messages: Message[];
  systemInstructions?: string;
}

export class StorageService {
  static saveConversation(conversation: Conversation) {
    try {
      const conversations = this.getConversationsList();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = {
          id: conversation.id,
          title: conversation.title,
          lastModified: Date.now()
        };
      } else {
        conversations.push({
          id: conversation.id,
          title: conversation.title,
          lastModified: Date.now()
        });
      }
      
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${conversation.id}`,
        JSON.stringify({
          ...conversation,
          messages: conversation.messages.slice(-MAX_MESSAGES)
        })
      );
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  static getConversation(id: string): Conversation | null {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading conversation:', error);
      return null;
    }
  }

  static getConversationsList(): Array<{ id: string; title: string; lastModified: number }> {
    try {
      const data = localStorage.getItem(CONVERSATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading conversations list:', error);
      return [];
    }
  }

  static deleteConversation(id: string) {
    try {
      const conversations = this.getConversationsList();
      const filteredConversations = conversations.filter(c => c.id !== id);
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filteredConversations));
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  static createNewConversation(): Conversation {
    const id = crypto.randomUUID();
    const conversation: Conversation = {
      id,
      title: 'Nueva conversación',
      lastModified: Date.now(),
      messages: [{
        text: "¡Hola! Soy un asistente de IA. ¿En qué puedo ayudarte hoy?",
        isBot: true
      }]
    };
    this.saveConversation(conversation);
    return conversation;
  }

  static saveGlobalInstructions(instructions: string) {
    localStorage.setItem(GLOBAL_INSTRUCTIONS_KEY, instructions);
  }

  static getGlobalInstructions(): string {
    return localStorage.getItem(GLOBAL_INSTRUCTIONS_KEY) || '';
  }
}