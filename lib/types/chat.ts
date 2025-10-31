export interface ChatUser {
  _id: string;
  name?: string;
  email: string;
  picture?: string;
  isOnline?: boolean;
}

export interface ChatMessage {
  id: string;
  tempId?: string;
  senderId: ChatUser;
  recipientId: ChatUser;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export interface OnlineUser {
  userId: string;
  userName: string;
  userEmail: string;
}

export interface TypingStatus {
  userId: string;
  userName?: string;
  isTyping: boolean;
}

export interface MessageNotification {
  messageId: string;
  senderId: ChatUser;
  content: string;
  createdAt: string;
}

