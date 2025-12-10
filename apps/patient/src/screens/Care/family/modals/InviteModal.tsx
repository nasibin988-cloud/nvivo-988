/**
 * InviteModal - Invite family members with access level selection
 */

import { X, Copy, CheckCircle } from 'lucide-react';
import { accessLevels, getAccessColor, type AccessLevel } from '../types';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteEmail: string;
  onInviteEmailChange: (email: string) => void;
  inviteRelationship: string;
  onInviteRelationshipChange: (relationship: string) => void;
  inviteAccess: AccessLevel;
  onInviteAccessChange: (access: AccessLevel) => void;
  copiedLink: boolean;
  onCopyLink: () => void;
  onSendInvite: () => void;
}

export function InviteModal({
  isOpen,
  onClose,
  inviteEmail,
  onInviteEmailChange,
  inviteRelationship,
  onInviteRelationshipChange,
  inviteAccess,
  onInviteAccessChange,
  copiedLink,
  onCopyLink,
  onSendInvite,
}: InviteModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Invite Family Member</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Email Address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => onInviteEmailChange(e.target.value)}
              placeholder="family@email.com"
              className="w-full px-4 py-3 bg-surface-2 rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-500/30"
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Relationship</label>
            <select
              value={inviteRelationship}
              onChange={(e) => onInviteRelationshipChange(e.target.value)}
              className="w-full px-4 py-3 bg-surface-2 rounded-xl border border-white/[0.04] text-sm text-text-primary focus:outline-none focus:border-rose-500/30"
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse / Partner</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="caregiver">Caregiver</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Access Level */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Access Level</label>
            <div className="space-y-2">
              {(Object.keys(accessLevels) as AccessLevel[]).map((level) => {
                const config = accessLevels[level];
                const color = getAccessColor(level);
                const isSelected = inviteAccess === level;
                return (
                  <button
                    key={level}
                    onClick={() => onInviteAccessChange(level)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      isSelected
                        ? `${color.bg} ${color.border} border`
                        : 'bg-surface-2 border-white/[0.04] hover:border-white/[0.08]'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? color.border : 'border-text-muted'
                      }`}
                    >
                      {isSelected && (
                        <div className={`w-2 h-2 rounded-full ${color.bg.replace('/15', '')}`} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? color.text : 'text-text-primary'
                        }`}
                      >
                        {config.label}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{config.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Or share link */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-surface text-text-muted">or share invite link</span>
            </div>
          </div>

          <button
            onClick={onCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary hover:bg-white/[0.08] transition-all"
          >
            {copiedLink ? (
              <>
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Invite Link</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSendInvite}
            disabled={!inviteEmail || !inviteRelationship}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              inviteEmail && inviteRelationship
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_4px_16px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.4)]'
                : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
            }`}
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}
