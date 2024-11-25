import React, { useState } from 'react';
import { X, Settings2 } from 'lucide-react';

interface SystemInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstructions: string;
  globalInstructions: string;
  onSave: (instructions: string, isGlobal: boolean) => void;
}

export const SystemInstructionsModal: React.FC<SystemInstructionsModalProps> = ({
  isOpen,
  onClose,
  currentInstructions,
  globalInstructions,
  onSave,
}) => {
  const [instructions, setInstructions] = useState(currentInstructions);
  const [isGlobal, setIsGlobal] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'global'>('current');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(instructions, isGlobal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-primary rounded-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-primary">Instrucciones del Sistema</h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'current'
                  ? 'bg-purple-600 text-white dark:bg-purple-500'
                  : 'bg-secondary text-secondary hover:bg-primary'
              }`}
            >
              Chat Actual
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'global'
                  ? 'bg-purple-600 text-white dark:bg-purple-500'
                  : 'bg-secondary text-secondary hover:bg-primary'
              }`}
            >
              Configuración Global
            </button>
          </div>

          {activeTab === 'current' ? (
            <>
              <p className="text-sm text-secondary mb-4">
                Define el comportamiento para esta conversación específica.
              </p>
              <div className="space-y-4">
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full h-64 p-3 border rounded-lg bg-primary text-primary border-border focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Instrucciones específicas para esta conversación..."
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isGlobal}
                    onChange={(e) => setIsGlobal(e.target.checked)}
                    className="rounded border-border text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-secondary">
                    Guardar también como configuración global
                  </span>
                </label>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-secondary mb-4">
                Define el comportamiento predeterminado para todas las conversaciones nuevas.
              </p>
              <textarea
                value={globalInstructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full h-64 p-3 border rounded-lg bg-primary text-primary border-border focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Instrucciones globales para todas las conversaciones..."
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-secondary hover:bg-secondary rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            Guardar Instrucciones
          </button>
        </div>
      </div>
    </div>
  );
};