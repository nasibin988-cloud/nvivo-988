/**
 * Conversations List Component
 * Main list view of all conversations
 */

import { Search, Plus } from 'lucide-react';
import type { Conversation } from '../types';
import { ConversationItem } from './ConversationItem';

interface ConversationsListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewMessage: () => void;
}

export function ConversationsList({
  conversations,
  onSelectConversation,
  onNewMessage,
}: ConversationsListProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Search and New Message */}
      <div className="flex gap-3">
        <div className="flex-1 relative group">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-blue-400 transition-colors"
          />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all"
          />
        </div>
        <button
          onClick={onNewMessage}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/25 hover:border-blue-500/50 transition-all"
        >
          <Plus size={18} />
          New
        </button>
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {conversations.map((convo) => (
          <ConversationItem
            key={convo.id}
            conversation={convo}
            onClick={() => onSelectConversation(convo.id)}
          />
        ))}
      </div>
    </div>
  );
}
