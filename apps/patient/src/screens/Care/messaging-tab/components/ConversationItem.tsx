/**
 * Conversation Item Component
 * Individual conversation card in the list
 */

import { CheckCheck } from 'lucide-react';
import type { Conversation } from '../types';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

export function ConversationItem({ conversation, onClick }: ConversationItemProps): React.ReactElement {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 group overflow-hidden ${
        conversation.unread > 0
          ? 'bg-gradient-to-br from-blue-500/[0.06] to-surface border-blue-500/15 shadow-[0_4px_20px_rgba(59,130,246,0.1)] hover:shadow-[0_6px_24px_rgba(59,130,246,0.15)]'
          : 'bg-surface border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08]'
      }`}
    >
      {/* Glow effect for unread */}
      {conversation.unread > 0 && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      )}

      {/* Unread indicator line */}
      {conversation.unread > 0 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      )}

      <div className="relative flex items-start gap-4">
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          <img
            src={conversation.avatarUrl}
            alt={conversation.provider}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-white/10 transition-all"
          />
          {conversation.isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm text-text-primary">{conversation.provider}</h4>
            <span
              className={`text-xs ${conversation.unread > 0 ? 'text-blue-400 font-medium' : 'text-text-muted'}`}
            >
              {conversation.timestamp}
            </span>
          </div>
          <span className="inline-block px-2 py-0.5 mb-2 rounded-full bg-white/[0.04] text-xs text-text-muted">
            {conversation.title}
          </span>
          <p
            className={`text-sm truncate ${conversation.unread > 0 ? 'text-text-secondary font-medium' : 'text-text-muted'}`}
          >
            {conversation.lastMessage}
          </p>
        </div>

        {/* Unread badge or read status */}
        <div className="flex-shrink-0 pt-1">
          {conversation.unread > 0 ? (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-medium shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              {conversation.unread}
            </span>
          ) : (
            <CheckCheck size={16} className="text-blue-400/40" />
          )}
        </div>
      </div>
    </div>
  );
}
