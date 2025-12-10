/**
 * Messaging Tab Types
 */

export interface Attachment {
  name: string;
  type: 'file' | 'image';
  size: string;
  preview?: string;
}

export interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

export interface Conversation {
  id: string;
  provider: string;
  title: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  messages: Message[];
}

export interface Recipient {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
}

export interface EmojiCategory {
  name: string;
  emojis: string[];
}
