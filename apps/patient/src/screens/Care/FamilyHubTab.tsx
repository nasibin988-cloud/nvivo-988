/**
 * Family Hub Tab
 * Manage family members, caregivers, health sharing, and family coordination
 */

import { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Eye,
  Heart,
  Clock,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  X,
  Check,
  AlertCircle,
  Settings,
  Activity,
  Pill,
  Calendar,
  FileText,
  Share2,
  Copy,
  CheckCircle,
  Link,
  Globe,
  BookOpen,
  Sparkles,
  User,
  RefreshCw,
  Bell,
  Lock,
} from 'lucide-react';

// Access level definitions
const accessLevels = {
  full: {
    label: 'Full Access',
    description: 'Can view all health data and manage appointments',
    color: 'emerald',
    permissions: ['vitals', 'medications', 'appointments', 'documents', 'activity'],
  },
  limited: {
    label: 'Limited Access',
    description: 'Can view vitals and upcoming appointments only',
    color: 'blue',
    permissions: ['vitals', 'appointments'],
  },
  emergency: {
    label: 'Emergency Only',
    description: 'Can only access emergency health info',
    color: 'amber',
    permissions: ['emergency'],
  },
};

type AccessLevel = keyof typeof accessLevels;

// Mock family members (people who can view MY data)
const mockFamilyMembers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    relationship: 'Spouse',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face&q=80',
    accessLevel: 'full' as AccessLevel,
    lastActive: '2 hours ago',
    isEmergencyContact: true,
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Michael Johnson',
    relationship: 'Son',
    email: 'mike.j@email.com',
    phone: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face&q=80',
    accessLevel: 'limited' as AccessLevel,
    lastActive: '1 day ago',
    isEmergencyContact: false,
    status: 'active' as const,
  },
  {
    id: '3',
    name: 'Emily Johnson',
    relationship: 'Daughter',
    email: 'emily.j@email.com',
    phone: '+1 (555) 345-6789',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face&q=80',
    accessLevel: 'emergency' as AccessLevel,
    lastActive: '3 days ago',
    isEmergencyContact: true,
    status: 'active' as const,
  },
];

// Mock people I am a caregiver FOR
const mockCaregivingFor = [
  {
    id: 'c1',
    name: 'Margaret Johnson',
    relationship: 'Mother',
    avatarUrl: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=200&h=200&fit=crop&crop=face&q=80',
    healthScore: 72,
    nextMedication: '2:00 PM - Metformin',
    nextAppointment: '12/12/24 - Dr. Smith',
    alertCount: 1,
  },
  {
    id: 'c2',
    name: 'Robert Johnson',
    relationship: 'Father',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&q=80',
    healthScore: 85,
    nextMedication: '6:00 PM - Lisinopril',
    nextAppointment: '12/18/24 - Dr. Williams',
    alertCount: 0,
  },
];

// Mock unified schedule
const mockUnifiedSchedule = [
  {
    id: 's1',
    time: '8:00 AM',
    type: 'medication' as const,
    title: 'Metformin 500mg',
    member: 'Margaret Johnson',
    memberColor: 'rose',
    status: 'completed' as const,
  },
  {
    id: 's2',
    time: '10:00 AM',
    type: 'appointment' as const,
    title: 'Dr. Anderson - Cardiology',
    member: 'You',
    memberColor: 'blue',
    status: 'upcoming' as const,
  },
  {
    id: 's3',
    time: '12:00 PM',
    type: 'medication' as const,
    title: 'Lisinopril 10mg',
    member: 'Robert Johnson',
    memberColor: 'emerald',
    status: 'upcoming' as const,
  },
  {
    id: 's4',
    time: '2:00 PM',
    type: 'medication' as const,
    title: 'Metformin 500mg',
    member: 'Margaret Johnson',
    memberColor: 'rose',
    status: 'upcoming' as const,
  },
  {
    id: 's5',
    time: '3:30 PM',
    type: 'task' as const,
    title: 'Weekly check-in call',
    member: 'Margaret Johnson',
    memberColor: 'rose',
    status: 'upcoming' as const,
  },
];

// Mock shared summaries
const mockSharedSummaries = [
  {
    id: 'sh1',
    recipientEmail: 'dr.smith@clinic.com',
    createdAt: '12/05/24',
    expiresAt: '12/12/24',
    accessCode: '806890',
    viewCount: 3,
    includesMetrics: true,
    includesMedications: true,
    includesAppointments: false,
  },
];

// Language options for Family Explainer
const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'tl', label: 'Tagalog' },
];

// Audience types for Family Explainer
const audienceTypes = [
  { id: 'spouse', label: 'Spouse/Partner', icon: Heart },
  { id: 'parent', label: 'Parent', icon: Users },
  { id: 'child', label: 'Child', icon: User },
  { id: 'sibling', label: 'Sibling', icon: Users },
  { id: 'friend', label: 'Friend', icon: User },
  { id: 'caregiver', label: 'Caregiver', icon: Shield },
];

export default function FamilyHubTab() {
  const [activeSection, setActiveSection] = useState<'members' | 'caregiving'>('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExplainerModal, setShowExplainerModal] = useState(false);
  const [showManageAccessModal, setShowManageAccessModal] = useState(false);
  const [showCaregiverDashboard, setShowCaregiverDashboard] = useState<string | null>(null);
  const [completedScheduleItems, setCompletedScheduleItems] = useState<Set<string>>(new Set(['s1']));
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('');
  const [inviteAccess, setInviteAccess] = useState<AccessLevel>('limited');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Share modal state
  const [shareEmail, setShareEmail] = useState('');
  const [shareDuration, setShareDuration] = useState('7');
  const [shareIncludeMetrics, setShareIncludeMetrics] = useState(true);
  const [shareIncludeMeds, setShareIncludeMeds] = useState(true);
  const [shareIncludeAppts, setShareIncludeAppts] = useState(true);

  // Explainer modal state
  const [explainerAudience, setExplainerAudience] = useState('spouse');
  const [explainerLanguage, setExplainerLanguage] = useState('en');
  const [explainerReadingLevel, setExplainerReadingLevel] = useState(3);
  const [explainerGenerated, setExplainerGenerated] = useState(false);

  const selectedMember = mockFamilyMembers.find((m) => m.id === showMemberModal);
  const selectedCaregiver = mockCaregivingFor.find((c) => c.id === showCaregiverDashboard);

  const handleToggleScheduleItem = (itemId: string) => {
    setCompletedScheduleItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://nvivo.health/invite/abc123');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getAccessColor = (level: AccessLevel) => {
    const colors = {
      full: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', text: 'text-emerald-400' },
      limited: { bg: 'bg-blue-500/15', border: 'border-blue-500/20', text: 'text-blue-400' },
      emergency: { bg: 'bg-amber-500/15', border: 'border-amber-500/20', text: 'text-amber-400' },
    };
    return colors[level];
  };

  const getMemberColor = (color: string) => {
    const colors: Record<string, string> = {
      rose: 'bg-rose-500',
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      violet: 'bg-violet-500',
      amber: 'bg-amber-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Caregiver Mode Toggle - Show if user is a caregiver */}
      {mockCaregivingFor.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/[0.1] via-surface to-surface-2 border border-violet-500/20 p-4">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/20">
                  <Eye size={18} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Caregiver Mode</h3>
                  <p className="text-xs text-text-muted">You are caring for {mockCaregivingFor.length} family members</p>
                </div>
              </div>
            </div>

            {/* Toggle between My Family / I'm Caring For */}
            <div className="flex gap-2 p-1 bg-white/[0.04] rounded-xl mb-4">
              <button
                onClick={() => setActiveSection('members')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'members'
                    ? 'bg-white/[0.08] text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                My Family
              </button>
              <button
                onClick={() => setActiveSection('caregiving')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'caregiving'
                    ? 'bg-white/[0.08] text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                I&apos;m Caring For
              </button>
            </div>

            {/* Caring For Cards */}
            {activeSection === 'caregiving' && (
              <div className="space-y-3">
                {mockCaregivingFor.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => setShowCaregiverDashboard(person.id)}
                    className="w-full text-left p-4 rounded-xl bg-surface border border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={person.avatarUrl}
                          alt={person.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-violet-500/20"
                        />
                        {person.alertCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-surface flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">{person.alertCount}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-text-primary">{person.name}</h4>
                          <span className="text-xs text-text-muted">({person.relationship})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Activity size={10} className="text-emerald-400" />
                            <span className="text-text-secondary">Score: {person.healthScore}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Pill size={10} className="text-blue-400" />
                            <span className="text-text-muted">{person.nextMedication}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-medium">
                          View Dashboard
                        </span>
                        <ChevronRight size={16} className="text-text-muted group-hover:text-text-secondary" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content - My Family Section */}
      {activeSection === 'members' && (
        <>
          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Share Health Summary */}
            <button
              onClick={() => setShowShareModal(true)}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/[0.08] via-surface to-surface-2 border border-teal-500/15 p-4 hover:border-teal-500/25 transition-all group text-left"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 w-fit mb-3">
                  <Share2 size={18} className="text-teal-400" />
                </div>
                <h4 className="font-medium text-text-primary text-sm mb-1">Share Summary</h4>
                <p className="text-xs text-text-muted">Generate secure health report</p>
              </div>
            </button>

            {/* Family Explainer */}
            <button
              onClick={() => setShowExplainerModal(true)}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-surface to-surface-2 border border-amber-500/15 p-4 hover:border-amber-500/25 transition-all group text-left"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit mb-3">
                  <BookOpen size={18} className="text-amber-400" />
                </div>
                <h4 className="font-medium text-text-primary text-sm mb-1">Family Explainer</h4>
                <p className="text-xs text-text-muted">Simplify health for family</p>
              </div>
            </button>
          </div>

          {/* Active Shared Summaries */}
          {mockSharedSummaries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-text-secondary">Active Shares</h3>
                <span className="text-xs text-text-muted">{mockSharedSummaries.length} active</span>
              </div>
              {mockSharedSummaries.map((share) => (
                <div
                  key={share.id}
                  className="p-4 rounded-2xl bg-surface border border-white/[0.04]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                        <Link size={16} className="text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{share.recipientEmail}</p>
                        <p className="text-xs text-text-muted">Expires {share.expiresAt} • {share.viewCount} views</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyCode(share.accessCode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                    >
                      {copiedCode === share.accessCode ? (
                        <CheckCircle size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} className="text-text-muted" />
                      )}
                      <span className="text-xs font-mono text-text-secondary">{share.accessCode}</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {share.includesMetrics && (
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-text-muted">Vitals</span>
                    )}
                    {share.includesMedications && (
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-text-muted">Meds</span>
                    )}
                    {share.includesAppointments && (
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-text-muted">Appts</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invite Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-2 border border-white/[0.08] p-4 hover:border-white/[0.15] hover:bg-surface-2 transition-all group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.06] via-transparent to-violet-500/[0.04] opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center justify-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <UserPlus size={18} className="text-rose-400" />
              </div>
              <span className="text-text-primary font-medium">Invite Family Member</span>
            </div>
          </button>

          {/* Family Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary px-1">Family Members</h3>
            {mockFamilyMembers.map((member) => {
              const accessColor = getAccessColor(member.accessLevel);
              return (
                <button
                  key={member.id}
                  onClick={() => setShowMemberModal(member.id)}
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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${accessColor.bg} ${accessColor.border} border ${accessColor.text}`}>
                          {accessLevels[member.accessLevel].label}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted">{member.relationship}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={10} className="text-text-muted" />
                        <span className="text-xs text-text-muted">Active {member.lastActive}</span>
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-text-muted group-hover:text-text-secondary transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Unified Family Schedule - Show when in caregiving mode */}
      {activeSection === 'caregiving' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-medium text-text-secondary">Today&apos;s Family Schedule</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[10px] text-text-muted">Margaret</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-text-muted">Robert</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] text-text-muted">You</span>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-white/[0.04] divide-y divide-white/[0.04]">
            {mockUnifiedSchedule.map((item) => {
              const Icon = item.type === 'medication' ? Pill : item.type === 'appointment' ? Calendar : CheckCircle;
              const isCompleted = completedScheduleItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 ${isCompleted ? 'opacity-50' : ''}`}
                >
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium text-text-secondary">{item.time}</span>
                  </div>
                  <div className={`w-1 h-10 rounded-full ${getMemberColor(item.memberColor)}`} />
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
                  }`}>
                    {isCompleted ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <Icon size={16} className="text-text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-text-muted">{item.member}</p>
                  </div>
                  <button
                    onClick={() => handleToggleScheduleItem(item.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-white/[0.04] border border-white/[0.08] hover:bg-emerald-500/20 hover:border-emerald-500/30'
                    }`}
                  >
                    <Check size={16} className={isCompleted ? 'text-white' : 'text-text-muted'} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share Health Summary Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <Share2 size={18} className="text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Share Health Summary</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Security notice */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-teal-500/[0.08] border border-teal-500/20">
                <Lock size={14} className="text-teal-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-teal-400/90">
                  Your summary will be protected with a 6-digit access code. Only people with the code can view it.
                </p>
              </div>

              {/* Recipient email */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Recipient Email (optional)</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="doctor@clinic.com"
                  className="w-full px-4 py-3 bg-surface-2 rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal-500/30"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Link Expires In</label>
                <div className="grid grid-cols-4 gap-2">
                  {['1', '7', '14', '30'].map((days) => (
                    <button
                      key={days}
                      onClick={() => setShareDuration(days)}
                      className={`py-2 rounded-xl text-sm font-medium transition-all ${
                        shareDuration === days
                          ? 'bg-teal-500/15 border border-teal-500/30 text-teal-400'
                          : 'bg-surface-2 border border-white/[0.04] text-text-secondary hover:bg-white/[0.06]'
                      }`}
                    >
                      {days} day{days !== '1' ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data to include */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Include in Summary</label>
                <div className="space-y-2">
                  {[
                    { key: 'metrics', label: 'Vitals & Metrics', icon: Activity, value: shareIncludeMetrics, setter: setShareIncludeMetrics },
                    { key: 'meds', label: 'Medications', icon: Pill, value: shareIncludeMeds, setter: setShareIncludeMeds },
                    { key: 'appts', label: 'Appointments', icon: Calendar, value: shareIncludeAppts, setter: setShareIncludeAppts },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => item.setter(!item.value)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          item.value
                            ? 'bg-teal-500/10 border-teal-500/20'
                            : 'bg-surface-2 border-white/[0.04] hover:border-white/[0.08]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={item.value ? 'text-teal-400' : 'text-text-muted'} />
                          <span className={`text-sm ${item.value ? 'text-text-primary' : 'text-text-secondary'}`}>{item.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${item.value ? 'bg-teal-500' : 'bg-white/[0.1]'}`}>
                          {item.value && <Check size={12} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium shadow-[0_4px_16px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] transition-all"
              >
                <Share2 size={16} />
                Generate Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Family Explainer Modal */}
      {showExplainerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <BookOpen size={18} className="text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Family Explainer</h3>
              </div>
              <button
                onClick={() => {
                  setShowExplainerModal(false);
                  setExplainerGenerated(false);
                }}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            {!explainerGenerated ? (
              <div className="space-y-4">
                {/* Info notice */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
                  <Sparkles size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-400/90">
                    AI will generate a simple explanation of your health conditions, medications, and care plan tailored for your family member.
                  </p>
                </div>

                {/* Audience type */}
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Who is this for?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {audienceTypes.map((audience) => {
                      const Icon = audience.icon;
                      const isSelected = explainerAudience === audience.id;
                      return (
                        <button
                          key={audience.id}
                          onClick={() => setExplainerAudience(audience.id)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              : 'bg-surface-2 border-white/[0.04] text-text-secondary hover:bg-white/[0.06]'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-xs font-medium">{audience.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reading level */}
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Reading Level</label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted">Simple</span>
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => setExplainerReadingLevel(level)}
                          className={`flex-1 h-2 rounded-full transition-all ${
                            level <= explainerReadingLevel
                              ? 'bg-amber-500'
                              : 'bg-white/[0.1]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-text-muted">Detailed</span>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Language</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <select
                      value={explainerLanguage}
                      onChange={(e) => setExplainerLanguage(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-2 rounded-xl border border-white/[0.04] text-sm text-text-primary focus:outline-none focus:border-amber-500/30 appearance-none"
                    >
                      {languageOptions.map((lang) => (
                        <option key={lang.code} value={lang.code}>{lang.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>

                {/* Generate button */}
                <button
                  onClick={() => setExplainerGenerated(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium shadow-[0_4px_16px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] transition-all"
                >
                  <Sparkles size={16} />
                  Generate Explanation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Generated explanation preview */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-amber-400 mb-2">What&apos;s Going On</h4>
                    <p className="text-sm text-text-secondary">
                      Your loved one has been managing a few health conditions. The main one is high blood pressure,
                      which means their heart has to work harder to pump blood. They also have type 2 diabetes,
                      which affects how their body uses sugar from food.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-400 mb-2">Their Medications</h4>
                    <p className="text-sm text-text-secondary">
                      They take Metformin twice daily (morning and evening) to help control blood sugar,
                      and Lisinopril once in the morning to keep blood pressure in check. It&apos;s important
                      they take these at the same time each day.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-400 mb-2">How You Can Help</h4>
                    <p className="text-sm text-text-secondary">
                      - Remind them to take medications if they forget<br />
                      - Help prepare heart-healthy, low-sugar meals<br />
                      - Encourage short daily walks<br />
                      - Drive them to doctor appointments
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-2">When to Get Help</h4>
                    <p className="text-sm text-text-secondary">
                      Call their doctor if you notice: severe headache, confusion,
                      extreme thirst, or if they feel faint. Call 911 for chest pain
                      or difficulty breathing.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExplainerGenerated(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
                  >
                    <RefreshCw size={14} />
                    Regenerate
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium shadow-[0_4px_16px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] transition-all">
                    <Share2 size={14} />
                    Share
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowExplainerModal(false);
                    setExplainerGenerated(false);
                  }}
                  className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Invite Family Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
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
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="family@email.com"
                  className="w-full px-4 py-3 bg-surface-2 rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-500/30"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Relationship</label>
                <select
                  value={inviteRelationship}
                  onChange={(e) => setInviteRelationship(e.target.value)}
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
                        onClick={() => setInviteAccess(level)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? `${color.bg} ${color.border} border`
                            : 'bg-surface-2 border-white/[0.04] hover:border-white/[0.08]'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? color.border : 'border-text-muted'}`}>
                          {isSelected && <div className={`w-2 h-2 rounded-full ${color.bg.replace('/15', '')}`} />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-sm font-medium ${isSelected ? color.text : 'text-text-primary'}`}>
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
                onClick={handleCopyLink}
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
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRelationship('');
                }}
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
      )}

      {/* Member Detail Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Family Member</h3>
              <button
                onClick={() => setShowMemberModal(null)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            {/* Member Info */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedMember.avatarUrl}
                alt={selectedMember.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
              />
              <div>
                <h4 className="font-semibold text-text-primary text-lg">{selectedMember.name}</h4>
                <p className="text-sm text-text-secondary">{selectedMember.relationship}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getAccessColor(selectedMember.accessLevel).bg} ${getAccessColor(selectedMember.accessLevel).text}`}>
                  {accessLevels[selectedMember.accessLevel].label}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                <Mail size={16} className="text-text-muted" />
                <span className="text-sm text-text-primary">{selectedMember.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                <Phone size={16} className="text-text-muted" />
                <span className="text-sm text-text-primary">{selectedMember.phone}</span>
              </div>
            </div>

            {/* Emergency Contact Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] mb-6">
              <div className="flex items-center gap-3">
                <Heart size={16} className={selectedMember.isEmergencyContact ? 'text-red-400 fill-red-400' : 'text-text-muted'} />
                <span className="text-sm text-text-primary">Emergency Contact</span>
              </div>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedMember.isEmergencyContact ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}>
                {selectedMember.isEmergencyContact && <Check size={10} className="text-white" />}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowMemberModal(null);
                  setShowManageAccessModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
              >
                <Settings size={16} />
                Manage Access
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-all">
                <X size={16} />
                Remove Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Access Modal */}
      {showManageAccessModal && selectedMember && (
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
                onClick={() => setShowManageAccessModal(false)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            {/* Member Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-6">
              <img
                src={selectedMember.avatarUrl}
                alt={selectedMember.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
              />
              <div>
                <h4 className="font-medium text-text-primary">{selectedMember.name}</h4>
                <p className="text-sm text-text-muted">{selectedMember.relationship}</p>
              </div>
            </div>

            {/* Access Level Selection */}
            <div className="mb-6">
              <label className="block text-sm text-text-secondary mb-3">Access Level</label>
              <div className="space-y-2">
                {(Object.keys(accessLevels) as AccessLevel[]).map((level) => {
                  const config = accessLevels[level];
                  const color = getAccessColor(level);
                  const isSelected = selectedMember.accessLevel === level;
                  return (
                    <button
                      key={level}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? `${color.bg} ${color.border} border`
                          : 'bg-surface-2 border-white/[0.04] hover:border-white/[0.08]'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? color.border : 'border-text-muted'}`}>
                        {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${color.bg.replace('/15', '')}`} />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-medium ${isSelected ? color.text : 'text-text-primary'}`}>
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
                {[
                  { id: 'vitals', label: 'View Vitals & Metrics', icon: Activity },
                  { id: 'medications', label: 'View Medications', icon: Pill },
                  { id: 'appointments', label: 'View Appointments', icon: Calendar },
                  { id: 'documents', label: 'View Documents', icon: FileText },
                  { id: 'activity', label: 'View Activity History', icon: Clock },
                ].map((perm) => {
                  const Icon = perm.icon;
                  const hasPermission = accessLevels[selectedMember.accessLevel].permissions.includes(perm.id);
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
                        <span className={`text-sm ${hasPermission ? 'text-text-primary' : 'text-text-muted'}`}>{perm.label}</span>
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
                {[
                  { label: 'Medication reminders', enabled: true },
                  { label: 'Appointment alerts', enabled: true },
                  { label: 'Health updates', enabled: false },
                ].map((setting) => (
                  <div
                    key={setting.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <Bell size={14} className="text-text-muted" />
                      <span className="text-sm text-text-secondary">{setting.label}</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${setting.enabled ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${setting.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowManageAccessModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowManageAccessModal(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all"
              >
                <Check size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Caregiver Dashboard Modal */}
      {showCaregiverDashboard && selectedCaregiver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-white/[0.08] max-w-lg w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-white/[0.04] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCaregiver.avatarUrl}
                  alt={selectedCaregiver.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/20"
                />
                <div>
                  <h3 className="font-semibold text-text-primary">{selectedCaregiver.name}</h3>
                  <p className="text-xs text-text-muted">{selectedCaregiver.relationship}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCaregiverDashboard(null)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Health Score */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/[0.1] via-surface to-surface-2 border border-emerald-500/20 p-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted mb-1">Health Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-emerald-400">{selectedCaregiver.healthScore}</span>
                      <span className="text-text-muted">/100</span>
                    </div>
                    <p className="text-xs text-emerald-400/80 mt-1">↑ 3 points this week</p>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                    <Activity size={28} className="text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Alert Banner */}
              {selectedCaregiver.alertCount > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
                  <AlertCircle size={18} className="text-red-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">Attention Needed</p>
                    <p className="text-xs text-red-400/70">Missed medication dose at 8:00 AM</p>
                  </div>
                  <ChevronRight size={16} className="text-red-400" />
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill size={14} className="text-blue-400" />
                    <span className="text-xs text-text-muted">Next Medication</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{selectedCaregiver.nextMedication}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-violet-400" />
                    <span className="text-xs text-text-muted">Next Appointment</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{selectedCaregiver.nextAppointment}</p>
                </div>
              </div>

              {/* Today's Schedule for this person */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Today&apos;s Schedule</h4>
                <div className="bg-white/[0.02] rounded-xl border border-white/[0.04] divide-y divide-white/[0.04]">
                  {mockUnifiedSchedule
                    .filter((item) => item.member === selectedCaregiver.name)
                    .map((item) => {
                      const Icon = item.type === 'medication' ? Pill : item.type === 'appointment' ? Calendar : CheckCircle;
                      const isCompleted = completedScheduleItems.has(item.id);
                      return (
                        <div key={item.id} className={`flex items-center gap-3 p-3 ${isCompleted ? 'opacity-50' : ''}`}>
                          <span className="text-xs text-text-muted w-14">{item.time}</span>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isCompleted ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
                          }`}>
                            {isCompleted ? <Check size={14} className="text-emerald-400" /> : <Icon size={14} className="text-text-muted" />}
                          </div>
                          <span className={`flex-1 text-sm ${isCompleted ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                            {item.title}
                          </span>
                          <button
                            onClick={() => handleToggleScheduleItem(item.id)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : 'bg-white/[0.04] border border-white/[0.08] hover:bg-emerald-500/20'
                            }`}
                          >
                            <Check size={12} className={isCompleted ? 'text-white' : 'text-text-muted'} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Recent Vitals */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Recent Vitals</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Blood Pressure', value: '128/82', unit: 'mmHg', status: 'normal' },
                    { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal' },
                    { label: 'Blood Sugar', value: '145', unit: 'mg/dL', status: 'elevated' },
                  ].map((vital) => (
                    <div key={vital.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                      <p className="text-xs text-text-muted mb-1">{vital.label}</p>
                      <p className={`text-lg font-semibold ${vital.status === 'elevated' ? 'text-amber-400' : 'text-text-primary'}`}>
                        {vital.value}
                      </p>
                      <p className="text-[10px] text-text-muted">{vital.unit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all">
                  <Phone size={16} />
                  Call
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500/[0.12] border border-violet-500/25 text-violet-400 font-medium hover:bg-violet-500/[0.18] hover:border-violet-500/35 transition-all">
                  <MessageSquare size={16} />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
