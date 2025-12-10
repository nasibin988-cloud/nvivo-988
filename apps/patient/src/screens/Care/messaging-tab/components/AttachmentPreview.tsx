/**
 * Attachment Preview Component
 */

import { X, File, FileText } from 'lucide-react';
import type { Attachment } from '../types';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (index: number) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps): React.ReactElement | null {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
      {attachments.map((att, index) => (
        <div key={index} className="relative group">
          {att.preview ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
              <img src={att.preview} alt={att.name} className="w-full h-full object-cover" />
              <button
                onClick={() => onRemove(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="relative flex items-center gap-2 px-3 py-2 bg-white/[0.04] rounded-lg border border-white/[0.06]">
              {att.name.endsWith('.pdf') ? (
                <FileText size={16} className="text-red-400" />
              ) : (
                <File size={16} className="text-blue-400" />
              )}
              <div className="max-w-[100px]">
                <p className="text-xs text-text-primary truncate">{att.name}</p>
                <p className="text-[10px] text-text-muted">{att.size}</p>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="ml-1 w-5 h-5 bg-white/[0.06] hover:bg-red-500/20 rounded-full flex items-center justify-center text-text-muted hover:text-red-400 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
