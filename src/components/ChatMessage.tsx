import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot }) => {
  return (
    <div className={`flex gap-3 ${isBot ? 'bg-secondary' : ''} p-4 rounded-lg`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isBot ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
      }`}>
        {isBot ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="flex-1 overflow-x-auto">
        <ReactMarkdown 
          className="text-sm leading-relaxed prose dark:prose-invert max-w-none"
          components={{
            p: ({ children }) => <div className="mb-4 last:mb-0">{children}</div>,
            code: ({ node, inline, className, children, ...props }) => {
              if (inline) {
                return (
                  <code className="bg-secondary px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <pre className="bg-secondary p-4 rounded-lg overflow-x-auto">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    </div>
  );
};