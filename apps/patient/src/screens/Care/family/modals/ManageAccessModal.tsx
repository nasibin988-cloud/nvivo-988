/**
 * ManageAccessModal - Configure access permissions for family member
 */

import {
  Shield,
  X,
  Check,
  CheckCircle,
  Lock,
  Bell,
  Activity,
  Pill,
  Calendar,
  FileText,
  Clock,
} from 'lucide-react';
import { accessLevels, getAccessColor, type FamilyMember, type AccessLevel } from '../types';

interface ManageAccessModalProps {
  isOpen: boolean;
  member: FamilyMember | undefined;
  onClose: () => void;
  onSave: () => void;
}

const permissionsList = [
  { id: 'vitals', label: 'View Vitals & Metrics', icon: Activity },
  { id: 'medications', label: 'View Medications', icon: Pill },
  { id: 'appointments', label: 'View Appointments', icon: Calendar },
  { id: 'documents', label: 'View Documents', icon: FileText },
  { id: 'activity', label: 'View Activity History', icon: Clock },
];

const notificationSettings = [
  { label: 'Medication reminders', enabled: true },
  { label: 'Appointment alerts', enabled: true },
  { label: 'Health updates', enabled: false },
];

export function ManageAccessModal({
  isOpen,
  member,
  onClose,
  onSave,
}: ManageAccessModalProps): React.ReactElement | null {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Shield size={18} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Manage Access</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Member Info */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-6">
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
          />
          <div>
            <h4 className="font-medium text-text-primary">{member.name}</h4>
            <p className="text-sm text-text-muted">{member.relationship}</p>
          </div>
        </div>

        {/* Access Level Selection */}
        <div className="mb-6">
          <label className="block text-sm text-text-secondary mb-3">Access Level</label>
          <div className="space-y-2">
            {(Object.keys(accessLevels) as AccessLevel[]).map((level) => {
              const config = accessLevels[level];
              const color = getAccessColor(level);
              const isSelected = member.accessLevel === level;
              return (
                <button
                  key={level}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    isSelected
                      ? `${color.bg} ${color.border} border`
                      : 'bg-surface-2 border-white/[0.04] hover:border-white/[0.08]'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? color.border : 'border-text-muted'
                    }`}
                  >
                    {isSelected && (
                      <div className={`w-2.5 h-2.5 rounded-full ${color.bg.replace('/15', '')}`} />
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

        {/* Permissions Detail */}
        <div className="mb-6">
          <label className="block text-sm text-text-secondary mb-3">Current Permissions</label>
          <div className="space-y-2">
            {permissionsList.map((perm) => {
              const Icon = perm.icon;
              const hasPermission = accessLevels[member.accessLevel].permissions.includes(perm.id);
              return (
                <div
                  key={perm.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    hasPermission
                      ? 'bg-emerald-500/[0.06] border-emerald-500/15'
                      : 'bg-white/[0.02] border-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={hasPermission ? 'text-emerald-400' : 'text-text-muted'} />
                    <span className={`text-sm ${hasPermission ? 'text-text-primary' : 'text-text-muted'}`}>
                      {perm.label}
                    </span>
                  </div>
                  {hasPermission ? (
                    <CheckCircle size={16} className="text-emerald-400" />
                  ) : (
                    <Lock size={14} className="text-text-muted" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mb-6">
          <label className="block text-sm text-text-secondary mb-3">Notification Settings</label>
          <div className="space-y-2">
            {notificationSettings.map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <Bell size={14} className="text-text-muted" />
                  <span className="text-sm text-text-secondary">{setting.label}</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    setting.enabled ? 'bg-emerald-500' : 'bg-white/[0.1]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all"
          >
            <Check size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
