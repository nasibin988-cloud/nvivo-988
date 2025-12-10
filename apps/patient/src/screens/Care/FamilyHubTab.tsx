/**
 * Family Hub Tab
 * Manage family members, caregivers, health sharing, and family coordination
 * Modularized version - main orchestrator component
 */

import { useState } from 'react';

// Types and mock data
import {
  type AccessLevel,
  mockFamilyMembers,
  mockCaregivingFor,
  mockUnifiedSchedule,
  mockSharedSummaries,
} from './family';

// UI Components
import {
  CaregiverModeToggle,
  QuickActionsRow,
  ActiveShares,
  InviteButton,
  FamilyMemberCard,
  UnifiedSchedule,
} from './family/components';

// Modals
import {
  ShareSummaryModal,
  FamilyExplainerModal,
  InviteModal,
  MemberDetailModal,
  ManageAccessModal,
  CaregiverDashboardModal,
} from './family/modals';

type ActiveSection = 'members' | 'caregiving';

export default function FamilyHubTab(): React.ReactElement {
  // Section state
  const [activeSection, setActiveSection] = useState<ActiveSection>('members');

  // Modal visibility state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExplainerModal, setShowExplainerModal] = useState(false);
  const [showManageAccessModal, setShowManageAccessModal] = useState(false);
  const [showCaregiverDashboard, setShowCaregiverDashboard] = useState<string | null>(null);

  // Schedule state
  const [completedScheduleItems, setCompletedScheduleItems] = useState<Set<string>>(
    new Set(['s1'])
  );

  // Invite form state
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

  // Derived state
  const selectedMember = mockFamilyMembers.find((m) => m.id === showMemberModal);
  const selectedCaregiver = mockCaregivingFor.find((c) => c.id === showCaregiverDashboard);

  // Handlers
  const handleToggleScheduleItem = (itemId: string): void => {
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

  const handleCopyLink = (): void => {
    navigator.clipboard.writeText('https://nvivo.health/invite/abc123');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = (code: string): void => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSendInvite = (): void => {
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRelationship('');
  };

  const handleMemberManageAccess = (): void => {
    setShowMemberModal(null);
    setShowManageAccessModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Caregiver Mode Toggle - Show if user is a caregiver */}
      <CaregiverModeToggle
        caregivingTargets={mockCaregivingFor}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onSelectCaregiver={setShowCaregiverDashboard}
      />

      {/* Main Content - My Family Section */}
      {activeSection === 'members' && (
        <>
          {/* Quick Actions Row */}
          <QuickActionsRow
            onShareClick={() => setShowShareModal(true)}
            onExplainerClick={() => setShowExplainerModal(true)}
          />

          {/* Active Shared Summaries */}
          <ActiveShares
            shares={mockSharedSummaries}
            copiedCode={copiedCode}
            onCopyCode={handleCopyCode}
          />

          {/* Invite Button */}
          <InviteButton onClick={() => setShowInviteModal(true)} />

          {/* Family Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary px-1">Family Members</h3>
            {mockFamilyMembers.map((member) => (
              <FamilyMemberCard
                key={member.id}
                member={member}
                onClick={() => setShowMemberModal(member.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Unified Family Schedule - Show when in caregiving mode */}
      {activeSection === 'caregiving' && (
        <UnifiedSchedule
          scheduleItems={mockUnifiedSchedule}
          completedItems={completedScheduleItems}
          onToggleItem={handleToggleScheduleItem}
        />
      )}

      {/* Share Health Summary Modal */}
      <ShareSummaryModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareEmail={shareEmail}
        onShareEmailChange={setShareEmail}
        shareDuration={shareDuration}
        onShareDurationChange={setShareDuration}
        shareIncludeMetrics={shareIncludeMetrics}
        onShareIncludeMetricsChange={setShareIncludeMetrics}
        shareIncludeMeds={shareIncludeMeds}
        onShareIncludeMedsChange={setShareIncludeMeds}
        shareIncludeAppts={shareIncludeAppts}
        onShareIncludeApptsChange={setShareIncludeAppts}
        onGenerate={() => setShowShareModal(false)}
      />

      {/* Family Explainer Modal */}
      <FamilyExplainerModal
        isOpen={showExplainerModal}
        onClose={() => setShowExplainerModal(false)}
        explainerAudience={explainerAudience}
        onAudienceChange={setExplainerAudience}
        explainerLanguage={explainerLanguage}
        onLanguageChange={setExplainerLanguage}
        explainerReadingLevel={explainerReadingLevel}
        onReadingLevelChange={setExplainerReadingLevel}
        explainerGenerated={explainerGenerated}
        onGenerate={() => setExplainerGenerated(true)}
        onRegenerate={() => setExplainerGenerated(false)}
      />

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteEmail={inviteEmail}
        onInviteEmailChange={setInviteEmail}
        inviteRelationship={inviteRelationship}
        onInviteRelationshipChange={setInviteRelationship}
        inviteAccess={inviteAccess}
        onInviteAccessChange={setInviteAccess}
        copiedLink={copiedLink}
        onCopyLink={handleCopyLink}
        onSendInvite={handleSendInvite}
      />

      {/* Member Detail Modal */}
      <MemberDetailModal
        isOpen={showMemberModal !== null}
        member={selectedMember}
        onClose={() => setShowMemberModal(null)}
        onManageAccess={handleMemberManageAccess}
        onRemoveAccess={() => setShowMemberModal(null)}
      />

      {/* Manage Access Modal */}
      <ManageAccessModal
        isOpen={showManageAccessModal}
        member={selectedMember}
        onClose={() => setShowManageAccessModal(false)}
        onSave={() => setShowManageAccessModal(false)}
      />

      {/* Caregiver Dashboard Modal */}
      <CaregiverDashboardModal
        isOpen={showCaregiverDashboard !== null}
        caregiver={selectedCaregiver}
        scheduleItems={mockUnifiedSchedule}
        completedItems={completedScheduleItems}
        onToggleItem={handleToggleScheduleItem}
        onClose={() => setShowCaregiverDashboard(null)}
      />
    </div>
  );
}
