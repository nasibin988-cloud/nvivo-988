/**
 * New Message View Component
 * Compose a new message to a care team member
 */

import { ArrowLeft, Send, X } from 'lucide-react';
import type { Recipient } from '../types';

interface NewMessageViewProps {
  recipients: Recipient[];
  selectedRecipientId: string;
  messageText: string;
  onSelectRecipient: (id: string) => void;
  onMessageChange: (text: string) => void;
  onSend: () => void;
  onBack: () => void;
}

export function NewMessageView({
  recipients,
  selectedRecipientId,
  messageText,
  onSelectRecipient,
  onMessageChange,
  onSend,
  onBack,
}: NewMessageViewProps): React.ReactElement {
  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] -mx-4 -my-2">
      {/* Header */}
      <div className="relative px-4 py-3 bg-gradient-to-b from-surface to-transparent border-b border-white/[0.04]">
        <div className="relative flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h4 className="font-medium text-text-primary">New Message</h4>
            <p className="text-xs text-text-muted">Select a recipient</p>
          </div>
        </div>
      </div>

      {/* Recipient Selection */}
      {!selectedRecipientId ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          <p className="text-xs text-text-muted mb-3 px-1">Your Care Team</p>
          {recipients.map((recipient) => (
            <button
              key={recipient.id}
              onClick={() => onSelectRecipient(recipient.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08] transition-all text-left"
            >
              <img
                src={recipient.avatarUrl}
                alt={recipient.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/5"
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-text-primary">{recipient.name}</h4>
                <p className="text-xs text-text-muted">{recipient.title}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Selected Recipient */}
          <div className="px-4 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted">To:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <img
                  src={selectedRecipient?.avatarUrl}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-xs text-blue-400 font-medium">{selectedRecipient?.name}</span>
                <button
                  onClick={() => onSelectRecipient('')}
                  className="ml-1 text-blue-400/60 hover:text-blue-400"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Message Compose Area */}
          <div className="flex-1 px-4 py-4">
            <textarea
              value={messageText}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Type your message..."
              className="w-full h-full min-h-[200px] bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none"
              autoFocus
            />
          </div>

          {/* Send Button */}
          <div className="px-4 py-3 border-t border-white/[0.04]">
            <button
              onClick={onSend}
              disabled={!messageText.trim()}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                messageText.trim()
                  ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25'
                  : 'bg-surface border border-border text-text-muted cursor-not-allowed'
              }`}
            >
              <Send size={16} />
              Send Message
            </button>
          </div>
        </>
      )}
    </div>
  );
}
