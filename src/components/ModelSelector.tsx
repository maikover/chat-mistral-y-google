import React from 'react';
import { Provider, ModelType } from '../services/types';

interface ModelSelectorProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ currentModel, onModelChange }) => {
  const handleProviderChange = (provider: Provider) => {
    const defaultModels = {
      gemini: 'gemini-1.5-pro',
      mistral: 'mistral-small',
      groq: 'mixtral-8x7b-32768'
    };
    onModelChange({ provider, model: defaultModels[provider] });
  };

  const handleModelChange = (model: string) => {
    onModelChange({ ...currentModel, model });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentModel.provider}
        onChange={(e) => handleProviderChange(e.target.value as Provider)}
        className="bg-primary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-primary"
      >
        <option value="gemini">Gemini AI</option>
        <option value="mistral">Mistral AI</option>
        <option value="groq">GROQ</option>
      </select>
      
      {currentModel.provider === 'gemini' ? (
        <select
          value={currentModel.model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="bg-primary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-primary"
        >
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
        </select>
      ) : currentModel.provider === 'mistral' ? (
        <select
          value={currentModel.model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="bg-primary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-primary"
        >
          <option value="mistral-tiny">Mistral Tiny</option>
          <option value="mistral-small">Mistral Small</option>
          <option value="mistral-medium">Mistral Medium</option>
        </select>
      ) : (
        <select
          value={currentModel.model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="bg-primary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-primary"
        >
          <option value="mixtral-8x7b-32768">Mixtral 8x7B-32K</option>
          <option value="gemma-7b-it">Gemma 7B-IT</option>
        </select>
      )}
    </div>
  );
};