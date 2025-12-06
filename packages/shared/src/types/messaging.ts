import type { Timestamp } from 'firebase/firestore';

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: Timestamp;
  unreadCount: number;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  read: boolean;
  readAt: Timestamp | null;
  createdAt: Timestamp;
}
