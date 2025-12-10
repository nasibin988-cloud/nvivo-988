/**
 * FamilyExplainerModal - AI-powered health explanation generator
 * Creates simplified health explanations for family members
 */

import { BookOpen, X, Sparkles, Globe, ChevronDown, RefreshCw, Share2 } from 'lucide-react';
import { languageOptions, audienceTypes } from '../types';

interface FamilyExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  explainerAudience: string;
  onAudienceChange: (audience: string) => void;
  explainerLanguage: string;
  onLanguageChange: (language: string) => void;
  explainerReadingLevel: number;
  onReadingLevelChange: (level: number) => void;
  explainerGenerated: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export function FamilyExplainerModal({
  isOpen,
  onClose,
  explainerAudience,
  onAudienceChange,
  explainerLanguage,
  onLanguageChange,
  explainerReadingLevel,
  onReadingLevelChange,
  explainerGenerated,
  onGenerate,
  onRegenerate,
}: FamilyExplainerModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  const handleClose = () => {
    onRegenerate(); // Reset generated state
    onClose();
  };

  return (
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
            onClick={handleClose}
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
                AI will generate a simple explanation of your health conditions, medications, and
                care plan tailored for your family member.
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
                      onClick={() => onAudienceChange(audience.id)}
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
                      onClick={() => onReadingLevelChange(level)}
                      className={`flex-1 h-2 rounded-full transition-all ${
                        level <= explainerReadingLevel ? 'bg-amber-500' : 'bg-white/[0.1]'
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
                <Globe
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <select
                  value={explainerLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-2 rounded-xl border border-white/[0.04] text-sm text-text-primary focus:outline-none focus:border-amber-500/30 appearance-none"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={onGenerate}
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
                  Your loved one has been managing a few health conditions. The main one is high
                  blood pressure, which means their heart has to work harder to pump blood. They
                  also have type 2 diabetes, which affects how their body uses sugar from food.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-amber-400 mb-2">Their Medications</h4>
                <p className="text-sm text-text-secondary">
                  They take Metformin twice daily (morning and evening) to help control blood sugar,
                  and Lisinopril once in the morning to keep blood pressure in check. It&apos;s
                  important they take these at the same time each day.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-amber-400 mb-2">How You Can Help</h4>
                <p className="text-sm text-text-secondary">
                  - Remind them to take medications if they forget
                  <br />
                  - Help prepare heart-healthy, low-sugar meals
                  <br />
                  - Encourage short daily walks
                  <br />- Drive them to doctor appointments
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-2">When to Get Help</h4>
                <p className="text-sm text-text-secondary">
                  Call their doctor if you notice: severe headache, confusion, extreme thirst, or if
                  they feel faint. Call 911 for chest pain or difficulty breathing.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onRegenerate}
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
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
