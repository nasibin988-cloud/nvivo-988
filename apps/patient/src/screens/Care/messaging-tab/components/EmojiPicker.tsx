/**
 * Emoji Picker Component
 */

import { X } from 'lucide-react';
import type { EmojiCategory } from '../types';

interface EmojiPickerProps {
  categories: EmojiCategory[];
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ categories, onSelect, onClose }: EmojiPickerProps): React.ReactElement {
  return (
    <div className="absolute bottom-20 left-4 right-4 bg-surface border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-primary">Emoji</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.06] text-text-muted">
          <X size={16} />
        </button>
      </div>
      <div className="space-y-3 max-h-[200px] overflow-y-auto">
        {categories.map((category) => (
          <div key={category.name}>
            <p className="text-xs text-text-muted mb-2">{category.name}</p>
            <div className="grid grid-cols-8 gap-1">
              {category.emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-white/[0.08] transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
