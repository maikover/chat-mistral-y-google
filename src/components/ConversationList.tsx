import React from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { StorageService } from '../services/storage';

interface ConversationListProps {
  currentId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  currentId,
  onSelect,
  onNew
}) => {
  const [conversations, setConversations] = React.useState(StorageService.getConversationsList());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState('');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      StorageService.deleteConversation(id);
      setConversations(StorageService.getConversationsList());
      if (id === currentId) {
        onNew();
      }
    }
  };

  const startEditing = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(title);
  };

  const saveTitle = (id: string) => {
    const conversation = StorageService.getConversation(id);
    if (conversation) {
      conversation.title = editingTitle;
      StorageService.saveConversation(conversation);
      setConversations(StorageService.getConversationsList());
      setEditingId(null);
    }
  };

  return (
    <div className="w-64 h-full bg-secondary border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          <Plus size={20} />
          Nueva Conversación
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.sort((a, b) => b.lastModified - a.lastModified).map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`p-3 cursor-pointer hover:bg-primary flex items-center gap-2 group ${
              conv.id === currentId ? 'bg-primary' : ''
            }`}
          >
            <MessageSquare size={20} className="text-secondary flex-shrink-0" />
            {editingId === conv.id ? (
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="flex-1 bg-primary border border-border rounded px-2 py-1 text-sm"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveTitle(conv.id);
                  }}
                  className="p-1 hover:text-green-500"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(null);
                  }}
                  className="p-1 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 truncate text-sm">{conv.title}</span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => startEditing(conv.id, conv.title, e)}
                    className="p-1 hover:text-blue-500"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-1 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};