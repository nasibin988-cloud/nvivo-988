/**
 * MemberDetailModal - View and manage individual family member
 */

import { X, Mail, Phone, Heart, Check, Settings } from 'lucide-react';
import { accessLevels, getAccessColor, type FamilyMember } from '../types';

interface MemberDetailModalProps {
  isOpen: boolean;
  member: FamilyMember | undefined;
  onClose: () => void;
  onManageAccess: () => void;
  onRemoveAccess: () => void;
}

export function MemberDetailModal({
  isOpen,
  member,
  onClose,
  onManageAccess,
  onRemoveAccess,
}: MemberDetailModalProps): React.ReactElement | null {
  if (!isOpen || !member) return null;

  const accessColor = getAccessColor(member.accessLevel);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Family Member</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Member Info */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
          />
          <div>
            <h4 className="font-semibold text-text-primary text-lg">{member.name}</h4>
            <p className="text-sm text-text-secondary">{member.relationship}</p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${accessColor.bg} ${accessColor.text}`}
            >
              {accessLevels[member.accessLevel].label}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
            <Mail size={16} className="text-text-muted" />
            <span className="text-sm text-text-primary">{member.email}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
            <Phone size={16} className="text-text-muted" />
            <span className="text-sm text-text-primary">{member.phone}</span>
          </div>
        </div>

        {/* Emergency Contact Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] mb-6">
          <div className="flex items-center gap-3">
            <Heart
              size={16}
              className={
                member.isEmergencyContact ? 'text-red-400 fill-red-400' : 'text-text-muted'
              }
            />
            <span className="text-sm text-text-primary">Emergency Contact</span>
          </div>
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              member.isEmergencyContact ? 'bg-emerald-500' : 'bg-white/[0.1]'
            }`}
          >
            {member.isEmergencyContact && <Check size={10} className="text-white" />}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onManageAccess}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
          >
            <Settings size={16} />
            Manage Access
          </button>
          <button
            onClick={onRemoveAccess}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-all"
          >
            <X size={16} />
            Remove Access
          </button>
        </div>
      </div>
    </div>
  );
}
