import React from 'react';
import { ChatMessage } from '../../lib/types/chat';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formattedTime = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <div className="flex-shrink-0">
            {message.senderId.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.senderId.picture}
                alt={message.senderId.name || message.senderId.email}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {(message.senderId.name || message.senderId.email).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
        <div>
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-900 rounded-bl-none'
            }`}
          >
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          </div>
          <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formattedTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

