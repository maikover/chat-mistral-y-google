import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Bot, Trash2, Settings2, Moon, Sun } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ModelSelector } from './components/ModelSelector';
import { SystemInstructionsModal } from './components/SystemInstructionsModal';
import { InputControls } from './components/InputControls';
import { ConversationList } from './components/ConversationList';
import { geminiService } from './services/gemini';
import { mistralService } from './services/mistral';
import { groqService } from './services/groq';
import { StorageService, Conversation } from './services/storage';
import { Message, ModelType } from './types';

function App() {
  const [currentConversation, setCurrentConversation] = useState<Conversation>(() => {
    const conversations = StorageService.getConversationsList();
    if (conversations.length > 0) {
      const lastConversation = StorageService.getConversation(conversations[0].id);
      return lastConversation || StorageService.createNewConversation();
    }
    return StorageService.createNewConversation();
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelType>({ 
    provider: 'gemini', 
    model: 'gemini-1.5-pro' 
  });
  const [imageData, setImageData] = useState<string | null>(null);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [globalInstructions, setGlobalInstructions] = useState(() => 
    StorageService.getGlobalInstructions()
  );
  const [isDarkMode, setIsDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [isListening, setIsListening] = useState(false);
  const [showMicReady, setShowMicReady] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const previousInputRef = useRef('');
  const micReadyTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!import.meta.env.VITE_GEMINI_API_KEY || !import.meta.env.VITE_MISTRAL_API_KEY || !import.meta.env.VITE_GROQ_API_KEY) {
      setError('Por favor agrega tus API keys en el archivo .env');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => {
        setShowMicReady(true);
        micReadyTimeoutRef.current = setTimeout(() => {
          setShowMicReady(false);
        }, 2000);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join(' ');
        
        setInput(previousInputRef.current + (previousInputRef.current ? ' ' : '') + transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setShowMicReady(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setShowMicReady(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (micReadyTimeoutRef.current) {
        clearTimeout(micReadyTimeoutRef.current);
      }
    };
  }, []);

  const getCurrentService = () => {
    const services = {
      gemini: geminiService,
      mistral: mistralService,
      groq: groqService
    };
    return services[currentModel.provider];
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      setError('Tu navegador no soporta entrada por voz');
      return;
    }

    if (!isListening) {
      previousInputRef.current = input;
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setShowMicReady(false);
      if (micReadyTimeoutRef.current) {
        clearTimeout(micReadyTimeoutRef.current);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    if (currentModel.provider !== 'gemini') {
      setError('Solo Gemini AI soporta el análisis de imágenes');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageData(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation.messages]);

  const handleModelChange = (model: ModelType) => {
    setCurrentModel(model);
    const service = getCurrentService();
    service.setModel(model.model);
    setImageData(null);
  };

  const handleSystemInstructions = (instructions: string, isGlobal: boolean) => {
    if (isGlobal) {
      setGlobalInstructions(instructions);
      StorageService.saveGlobalInstructions(instructions);
    }
    
    const updatedConversation = {
      ...currentConversation,
      systemInstructions: instructions,
      lastModified: Date.now()
    };
    
    setCurrentConversation(updatedConversation);
    StorageService.saveConversation(updatedConversation);
    getCurrentService().setSystemInstructions(instructions);
  };

  const clearChat = () => {
    const newConversation = StorageService.createNewConversation();
    setCurrentConversation(newConversation);
    setImageData(null);
    getCurrentService().resetChat();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const regenerateMessage = async (index: number) => {
    const messageToRegenerate = currentConversation.messages[index];
    if (!messageToRegenerate.userMessage) return;

    setIsLoading(true);
    setError(null);

    try {
      const service = getCurrentService();
      const response = await service.chat(
        messageToRegenerate.userMessage,
        messageToRegenerate.userImageData || undefined
      );

      const newMessages = [...currentConversation.messages];
      newMessages[index] = {
        ...messageToRegenerate,
        text: response
      };

      const updatedConversation = {
        ...currentConversation,
        messages: newMessages,
        lastModified: Date.now()
      };

      setCurrentConversation(updatedConversation);
      StorageService.saveConversation(updatedConversation);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imageData) || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    const newMessages = [
      ...currentConversation.messages,
      { 
        text: userMessage || "Analiza esta imagen por favor", 
        isBot: false,
        imageData: imageData || undefined
      }
    ];

    const updatedConversation = {
      ...currentConversation,
      messages: newMessages,
      lastModified: Date.now()
    };

    setCurrentConversation(updatedConversation);
    StorageService.saveConversation(updatedConversation);

    setIsLoading(true);

    try {
      const service = getCurrentService();
      const response = await service.chat(userMessage || "Describe esta imagen en detalle", imageData);
      
      const finalMessages = [
        ...newMessages,
        { 
          text: response, 
          isBot: true,
          userMessage: userMessage || "Describe esta imagen en detalle",
          userImageData: imageData || undefined
        }
      ];

      const finalConversation = {
        ...currentConversation,
        messages: finalMessages,
        lastModified: Date.now()
      };

      setCurrentConversation(finalConversation);
      StorageService.saveConversation(finalConversation);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setImageData(null);
    }
  };

  const handleNewConversation = () => {
    const newConversation = StorageService.createNewConversation();
    setCurrentConversation(newConversation);
    setImageData(null);
    getCurrentService().resetChat();
  };

  const handleSelectConversation = (id: string) => {
    const conversation = StorageService.getConversation(id);
    if (conversation) {
      setCurrentConversation(conversation);
      setImageData(null);
      getCurrentService().resetChat();
      if (conversation.systemInstructions) {
        getCurrentService().setSystemInstructions(conversation.systemInstructions);
      }
    }
  };

  return (
    <div className="flex h-screen bg-primary">
      <ConversationList
        currentId={currentConversation.id}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-primary border-b border-border w-full">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <h1 className="text-xl font-semibold">El Chat Que No Lograrán Tumbar</h1>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <ModelSelector currentModel={currentModel} onModelChange={handleModelChange} />
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-secondary hover:bg-secondary rounded-lg transition-colors"
                  title={isDarkMode ? "Modo claro" : "Modo oscuro"}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={() => setIsInstructionsModalOpen(true)}
                  className="p-2 text-secondary hover:bg-secondary rounded-lg transition-colors"
                  title="Instrucciones del Sistema"
                >
                  <Settings2 size={20} />
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 text-secondary hover:bg-secondary rounded-lg transition-colors"
                  title="Limpiar chat"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-2">
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 p-3 rounded-lg">
                  {error}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4">
            <div className="space-y-4">
              {currentConversation.messages.map((message, index) => (
                <div key={index}>
                  <ChatMessage 
                    message={message.text} 
                    isBot={message.isBot} 
                    onRegenerate={message.isBot ? () => regenerateMessage(index) : undefined}
                  />
                  {message.imageData && (
                    <div className="flex justify-center p-4 bg-primary rounded-lg border border-border mt-2">
                      <img src={message.imageData} alt="Uploaded" className="max-h-64 rounded" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-secondary p-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Pensando...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>

        <footer className="border-t border-border bg-primary">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <InputControls
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              error={error}
              imageData={imageData}
              isListening={isListening}
              showMicReady={showMicReady}
              handleImageUpload={handleImageUpload}
              startVoiceInput={startVoiceInput}
              stopVoiceInput={stopVoiceInput}
              handleSubmit={handleSubmit}
            />
          </div>
        </footer>

        <SystemInstructionsModal
          isOpen={isInstructionsModalOpen}
          onClose={() => setIsInstructionsModalOpen(false)}
          currentInstructions={currentConversation.systemInstructions || ''}
          globalInstructions={globalInstructions}
          onSave={handleSystemInstructions}
        />
      </div>
    </div>
  );
}

export default App;