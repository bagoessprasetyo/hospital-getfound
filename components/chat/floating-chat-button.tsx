'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ChatInterface } from './chat-interface';
import { cn } from '@/lib/utils';

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={toggleChat}
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out",
          "bg-black hover:bg-gray-800 text-white",
          "hover:scale-110 hover:shadow-xl",
          "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
          "active:scale-95"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <div className="relative">
          <MessageCircle 
            className={cn(
              "h-6 w-6 transition-all duration-300",
              isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
            )} 
          />
          <X 
            className={cn(
              "h-6 w-6 absolute inset-0 transition-all duration-300",
              isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )} 
          />
        </div>
      </Button>

      {/* Chat Sheet Modal */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="w-full sm:w-96 p-0 border-r border-gray-200"
        >
          <div className="h-full flex flex-col">
            <SheetHeader className="sr-only">
              <SheetTitle>Healthcare Chat Assistant</SheetTitle>
            </SheetHeader>
            <ChatInterface />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}