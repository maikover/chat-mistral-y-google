import React, { useState } from 'react';
import { X, Settings2 } from 'lucide-react';

interface SystemInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstructions: string;
  onSave: (instructions: string) => void;
}

export const SystemInstructionsModal: React.FC<SystemInstructionsModalProps> = ({
  isOpen,
  onClose,
  currentInstructions,
  onSave,
}) => {
  const [instructions, setInstructions] = useState(currentInstructions);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(instructions);
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
          <p className="text-sm text-secondary mb-4">
            Define el comportamiento, tono y estilo de respuesta del asistente. Estas instrucciones se aplicarán a toda la conversación.
          </p>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full h-64 p-3 border rounded-lg bg-primary text-primary border-border focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Ejemplo: Actúa como un experto en programación. Proporciona respuestas detalladas y técnicas. Incluye ejemplos de código cuando sea relevante..."
          />
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