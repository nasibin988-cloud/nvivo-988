/**
 * Message Input Component
 * Input area with attachment and emoji support
 */

import { useRef } from 'react';
import { Paperclip, Image, Smile, Send } from 'lucide-react';
import type { Attachment, EmojiCategory } from '../types';
import { formatFileSize } from '../utils';
import { EmojiPicker } from './EmojiPicker';
import { AttachmentPreview } from './AttachmentPreview';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  showEmojiPicker: boolean;
  onToggleEmojiPicker: () => void;
  emojiCategories: EmojiCategory[];
}

export function MessageInput({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  showEmojiPicker,
  onToggleEmojiPicker,
  emojiCategories,
}: MessageInputProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image'): void => {
    const files = e.target.files;
    if (files) {
      const newAttachments: Attachment[] = [];
      Array.from(files).forEach((file) => {
        const attachment: Attachment = {
          name: file.name,
          type,
          size: formatFileSize(file.size),
        };
        if (type === 'image' && file.type.startsWith('image/')) {
          attachment.preview = URL.createObjectURL(file);
        }
        newAttachments.push(attachment);
      });
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
    e.target.value = '';
  };

  const removeAttachment = (index: number): void => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string): void => {
    onChange(value + emoji);
    onToggleEmojiPicker();
  };

  const canSend = value.trim() || attachments.length > 0;

  return (
    <div className="px-4 py-3 bg-gradient-to-t from-surface via-surface to-transparent">
      <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />

      {showEmojiPicker && (
        <EmojiPicker
          categories={emojiCategories}
          onSelect={insertEmoji}
          onClose={onToggleEmojiPicker}
        />
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
        onChange={(e) => handleFileSelect(e, 'file')}
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'image')}
      />

      <div className="relative flex items-center gap-2 p-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl hover:bg-white/[0.06] text-text-muted hover:text-text-secondary transition-all"
        >
          <Paperclip size={18} />
        </button>
        <button
          onClick={() => imageInputRef.current?.click()}
          className="p-2 rounded-xl hover:bg-white/[0.06] text-text-muted hover:text-text-secondary transition-all"
        >
          <Image size={18} />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none py-2"
        />
        <button
          onClick={onToggleEmojiPicker}
          className={`p-2 rounded-xl transition-all ${
            showEmojiPicker
              ? 'bg-blue-500/20 text-blue-400'
              : 'hover:bg-white/[0.06] text-text-muted hover:text-text-secondary'
          }`}
        >
          <Smile size={18} />
        </button>
        <button
          className={`p-2.5 rounded-xl transition-all ${
            canSend
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)] hover:scale-105'
              : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
          }`}
          disabled={!canSend}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
