'use client';

import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-2xl text-sm",
        isUser 
          ? "bg-black text-white rounded-br-md" 
          : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
      )}>
        <p className="whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className={cn(
          "text-xs mt-2 opacity-70",
          isUser ? "text-gray-300" : "text-gray-500"
        )}>
          {(() => {
            const timestamp = message.timestamp instanceof Date 
              ? message.timestamp 
              : new Date(message.timestamp);
            return timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          })()}
        </div>
      </div>
    </div>
  );
}