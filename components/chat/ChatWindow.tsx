'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../lib/types/auth';
import { ChatMessage } from '../../lib/types/chat';
import { useSocket } from '../../lib/socket/SocketContext';
import { useAppSelector } from '../../lib/store/hooks';
import MessageBubble from './MessageBubble';
import { Send, ArrowLeft } from 'lucide-react';
import { Button } from '../ui';

interface ChatWindowProps {
  selectedUser: User;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, onBack, showBackButton = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAppSelector((state) => state.auth);
  const { sendMessage, joinConversation, leaveConversation, startTyping, stopTyping, onReceiveMessage, onUserTypingStart, onUserTypingStop } = useSocket();

  useEffect(() => {
    if (selectedUser && user) {
      // Join conversation room
      joinConversation(selectedUser._id);

      // Listen for incoming messages
      const unsubscribe = onReceiveMessage((message) => {
        // Only add messages from this conversation
        if (
          (message.senderId._id === user._id && message.recipientId._id === selectedUser._id) ||
          (message.senderId._id === selectedUser._id && message.recipientId._id === user._id)
        ) {
          setMessages((prev) => {
            // Avoid duplicates
            const exists = prev.find((m) => m.id === message.id || m.tempId === message.tempId);
            if (exists) return prev;
            return [...prev, message];
          });
        }
      });

      return () => {
        leaveConversation(selectedUser._id);
        unsubscribe();
      };
    }
  }, [selectedUser, user, joinConversation, leaveConversation, onReceiveMessage]);

  useEffect(() => {
    // Listen for typing indicators
    const unsubscribeTypingStart = onUserTypingStart((data) => {
      if (data.userId === selectedUser._id) {
        setIsTyping(true);
      }
    });

    const unsubscribeTypingStop = onUserTypingStop((data) => {
      if (data.userId === selectedUser._id) {
        setIsTyping(false);
      }
    });

    return () => {
      unsubscribeTypingStart();
      unsubscribeTypingStop();
    };
  }, [selectedUser, onUserTypingStart, onUserTypingStop]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Emit typing indicator
    if (!typingTimeout) {
      startTyping(selectedUser._id);
    }

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      stopTyping(selectedUser._id);
      setTypingTimeout(null);
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !user) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Optimistically add message to UI
    const optimisticMessage: ChatMessage = {
      id: tempId,
      tempId,
      senderId: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      recipientId: {
        _id: selectedUser._id,
        name: selectedUser.name,
        email: selectedUser.email,
        picture: selectedUser.picture,
      },
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    
    // Send message via socket
    sendMessage(selectedUser._id, inputValue.trim(), tempId);
    
    setInputValue('');
    stopTyping(selectedUser._id);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        {showBackButton && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to users list"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <div className="relative">
          {selectedUser.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedUser.picture}
              alt={selectedUser.name || selectedUser.email}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{selectedUser.name || 'Anonymous'}</h2>
          <p className="text-xs text-gray-500">{isTyping ? 'typing...' : selectedUser.email}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-white rounded-full p-6 shadow-lg mb-4">
              <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId._id === user._id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="bg-white border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim()}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

