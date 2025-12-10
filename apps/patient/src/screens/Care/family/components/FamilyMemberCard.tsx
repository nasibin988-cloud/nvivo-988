/**
 * FamilyMemberCard - Individual family member display card
 */

import { Heart, Clock, ChevronRight } from 'lucide-react';
import { accessLevels, getAccessColor, type FamilyMember } from '../types';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onClick: () => void;
}

export function FamilyMemberCard({ member, onClick }: FamilyMemberCardProps): React.ReactElement {
  const accessColor = getAccessColor(member.accessLevel);

  return (
    <button
      onClick={onClick}
      className="w-full text-left relative overflow-hidden rounded-2xl bg-surface border border-white/[0.04] p-4 hover:bg-surface-2 hover:border-white/[0.08] transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10"
          />
          {member.isEmergencyContact && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-surface flex items-center justify-center">
              <Heart size={10} className="text-white fill-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-text-primary">{member.name}</h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${accessColor.bg} ${accessColor.border} border ${accessColor.text}`}
            >
              {accessLevels[member.accessLevel].label}
            </span>
          </div>
          <p className="text-sm text-text-muted">{member.relationship}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={10} className="text-text-muted" />
            <span className="text-xs text-text-muted">Active {member.lastActive}</span>
          </div>
        </div>

        <ChevronRight
          size={18}
          className="text-text-muted group-hover:text-text-secondary transition-colors"
        />
      </div>
    </button>
  );
}
