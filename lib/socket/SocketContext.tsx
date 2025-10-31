'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../store/hooks';
import { ChatMessage, OnlineUser } from '../types/chat';
import { toast } from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  sendMessage: (recipientId: string, content: string, tempId?: string) => void;
  joinConversation: (otherUserId: string) => void;
  leaveConversation: (otherUserId: string) => void;
  startTyping: (recipientId: string) => void;
  stopTyping: (recipientId: string) => void;
  onReceiveMessage: (callback: (message: ChatMessage) => void) => () => void;
  onUserTypingStart: (callback: (data: { userId: string; userName?: string }) => void) => () => void;
  onUserTypingStop: (callback: (data: { userId: string }) => void) => () => void;
  onUserOnline: (callback: (user: OnlineUser) => void) => () => void;
  onUserOffline: (callback: (data: { userId: string }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  sendMessage: () => {},
  joinConversation: () => {},
  leaveConversation: () => {},
  startTyping: () => {},
  stopTyping: () => {},
  onReceiveMessage: () => () => {},
  onUserTypingStart: () => () => {},
  onUserTypingStop: () => () => {},
  onUserOnline: () => () => {},
  onUserOffline: () => () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    console.log('🔄 SocketProvider useEffect - isAuthenticated:', isAuthenticated);

    if (!isAuthenticated) {
      console.log('❌ User not authenticated, disconnecting socket');
      if (socket) {
        console.log("Socket Disconnected - user logged out")
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    console.log('🔌 Attempting to connect to Socket.IO server at:', socketUrl);
    console.log('🍪 Using httpOnly cookies for authentication (credentials: include)');

    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    console.log('🔌 Socket instance created');

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected successfully! Socket ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      console.error('Full error:', error);
      setIsConnected(false);
    });

    socketInstance.on('online_users', (users: OnlineUser[]) => {
      console.log('👥 Received online users list:', users);
      setOnlineUsers(users);
    });

    socketInstance.on('user_online', (user: OnlineUser) => {
      console.log('✅ User came online:', user);
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.userId === user.userId);
        if (exists) return prev;
        return [...prev, user];
      });
    });

    socketInstance.on('user_offline', (data: { userId: string }) => {
      console.log('❌ User went offline:', data.userId);
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Realtime notifications
    socketInstance.on('post_created', () => {
      toast.success('A new post was added');
    });

    socketInstance.on('comment_created', () => {
      toast.success('A new comment was added');
    });

    setSocket(socketInstance);

    return () => {
      console.log('🧹 Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [isAuthenticated]);

  const sendMessage = useCallback((recipientId: string, content: string, tempId?: string) => {
    if (socket && isConnected) {
      socket.emit('send_message', { recipientId, content, tempId });
    }
  }, [socket, isConnected]);

  const joinConversation = useCallback((otherUserId: string) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', otherUserId);
    }
  }, [socket, isConnected]);

  const leaveConversation = useCallback((otherUserId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', otherUserId);
    }
  }, [socket, isConnected]);

  const startTyping = useCallback((recipientId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { recipientId });
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((recipientId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { recipientId });
    }
  }, [socket, isConnected]);

  const onReceiveMessage = useCallback((callback: (message: ChatMessage) => void) => {
    if (socket) {
      socket.on('receive_message', callback);
      return () => {
        socket.off('receive_message', callback);
      };
    }
    return () => {};
  }, [socket]);

  const onUserTypingStart = useCallback((callback: (data: { userId: string; userName?: string }) => void) => {
    if (socket) {
      socket.on('user_typing_start', callback);
      return () => {
        socket.off('user_typing_start', callback);
      };
    }
    return () => {};
  }, [socket]);

  const onUserTypingStop = useCallback((callback: (data: { userId: string }) => void) => {
    if (socket) {
      socket.on('user_typing_stop', callback);
      return () => {
        socket.off('user_typing_stop', callback);
      };
    }
    return () => {};
  }, [socket]);

  const onUserOnline = useCallback((callback: (user: OnlineUser) => void) => {
    if (socket) {
      socket.on('user_online', callback);
      return () => {
        socket.off('user_online', callback);
      };
    }
    return () => {};
  }, [socket]);

  const onUserOffline = useCallback((callback: (data: { userId: string }) => void) => {
    if (socket) {
      socket.on('user_offline', callback);
      return () => {
        socket.off('user_offline', callback);
      };
    }
    return () => {};
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        sendMessage,
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
        onReceiveMessage,
        onUserTypingStart,
        onUserTypingStop,
        onUserOnline,
        onUserOffline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

