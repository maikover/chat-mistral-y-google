import React from 'react';
import { Bot, User, Copy, Check, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  onRegenerate?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot, onRegenerate }) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = React.useState(false);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyFullMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isBot ? 'bg-secondary' : ''} p-4 rounded-lg`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isBot ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
      }`}>
        {isBot ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="flex-1">
        <div className="overflow-x-auto">
          <ReactMarkdown 
            className="text-sm leading-relaxed prose dark:prose-invert max-w-none"
            components={{
              p: ({ children }) => <div className="mb-4 last:mb-0">{children}</div>,
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');

                if (inline) {
                  return (
                    <code className="bg-secondary px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="absolute right-2 top-2 p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
                      title={copiedCode === code ? "¡Copiado!" : "Copiar código"}
                    >
                      {copiedCode === code ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-gray-400" />
                      )}
                    </button>
                    <SyntaxHighlighter
                      {...props}
                      style={oneDark}
                      language={match ? match[1] : 'text'}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        backgroundColor: '#1e1e1e'
                      }}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                );
              },
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
        {isBot && (
          <div className="flex gap-2 mt-4 justify-end">
            <button
              onClick={copyFullMessage}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-secondary"
              title={copiedMessage ? "¡Copiado!" : "Copiar respuesta completa"}
            >
              {copiedMessage ? (
                <>
                  <Check size={14} />
                  Copiado
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copiar respuesta
                </>
              )}
            </button>
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 transition-colors text-purple-600 dark:text-purple-300"
              title="Regenerar respuesta"
            >
              <RefreshCw size={14} />
              Regenerar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};