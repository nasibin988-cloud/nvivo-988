/**
 * Message Bubble Component
 * Individual message in a conversation
 */

import { CheckCheck } from 'lucide-react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  avatarUrl?: string;
  showAvatar?: boolean;
}

export function MessageBubble({ message, avatarUrl, showAvatar }: MessageBubbleProps): React.ReactElement {
  return (
    <div className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[80%] px-4 py-3 rounded-2xl ${
          message.fromMe
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md shadow-[0_4px_16px_rgba(59,130,246,0.3)]'
            : 'bg-surface border border-white/[0.06] text-text-primary rounded-bl-md'
        }`}
      >
        {!message.fromMe && showAvatar && avatarUrl && (
          <div className="absolute -left-12 top-0 w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/5">
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <p className="text-sm leading-relaxed">{message.text}</p>
        <div className={`flex items-center gap-1 mt-1 ${message.fromMe ? 'justify-end' : ''}`}>
          <span className={`text-[10px] ${message.fromMe ? 'text-white/60' : 'text-text-muted'}`}>
            {message.time}
          </span>
          {message.fromMe && <CheckCheck size={12} className="text-white/60" />}
        </div>
      </div>
    </div>
  );
}
