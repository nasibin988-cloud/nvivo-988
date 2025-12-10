/**
 * Conversation Detail Component
 * Full conversation view with messages and input
 */

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Conversation, Attachment, EmojiCategory } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ConversationDetailProps {
  conversation: Conversation;
  emojiCategories: EmojiCategory[];
  onBack: () => void;
}

export function ConversationDetail({
  conversation,
  emojiCategories,
  onBack,
}: ConversationDetailProps): React.ReactElement {
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] -mx-4 -my-2">
      {/* Header */}
      <div className="relative px-4 py-3 bg-gradient-to-b from-surface to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] to-transparent" />
        <div className="relative flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <img
              src={conversation.avatarUrl}
              alt={conversation.provider}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
            />
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-text-primary text-sm">{conversation.provider}</h4>
            <p className="text-xs text-text-muted">{conversation.isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversation.messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            avatarUrl={conversation.avatarUrl}
            showAvatar={index === 0}
          />
        ))}
      </div>

      {/* Input */}
      <MessageInput
        value={messageInput}
        onChange={setMessageInput}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        showEmojiPicker={showEmojiPicker}
        onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
        emojiCategories={emojiCategories}
      />
    </div>
  );
}
