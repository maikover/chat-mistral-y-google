import React, { useRef } from 'react';
import { SendHorizontal, ImagePlus, Mic } from 'lucide-react';

interface InputControlsProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  imageData: string | null;
  isListening: boolean;
  showMicReady: boolean;
  handleImageUpload: (file: File) => void;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const InputControls: React.FC<InputControlsProps> = ({
  input,
  setInput,
  isLoading,
  error,
  imageData,
  isListening,
  showMicReady,
  handleImageUpload,
  startVoiceInput,
  stopVoiceInput,
  handleSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
    // Focus the textarea after submission
    setTimeout(() => {
      textAreaRef.current?.focus();
    }, 0);
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-secondary hover:bg-secondary rounded-lg transition-colors"
          title="Subir imagen"
        >
          <ImagePlus size={20} />
        </button>
        <button
          type="button"
          onMouseDown={startVoiceInput}
          onMouseUp={stopVoiceInput}
          onMouseLeave={stopVoiceInput}
          className={`p-2 rounded-lg transition-colors relative ${
            isListening 
              ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900' 
              : 'text-secondary hover:bg-secondary'
          }`}
          title="Mantén presionado para grabar"
        >
          <Mic size={20} />
          {showMicReady && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-green-500 text-white text-xs py-1 px-2 rounded">
              ¡Micrófono listo! Habla ahora
            </div>
          )}
        </button>
      </div>
      <div className="flex-1 flex items-center gap-4">
        <textarea
          ref={textAreaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleFormSubmit(e);
            }
          }}
          placeholder="Escribe tu mensaje..."
          className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent textarea-expand bg-primary text-primary"
          disabled={isLoading || !!error}
          rows={1}
          autoFocus
        />
        <button
          type="submit"
          disabled={(!input.trim() && !imageData) || isLoading || !!error}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 dark:bg-purple-500 dark:hover:bg-purple-600 flex-shrink-0"
        >
          <SendHorizontal className="w-4 h-4" />
          Enviar
        </button>
      </div>
    </form>
  );
};