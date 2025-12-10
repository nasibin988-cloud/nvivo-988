/**
 * Wellness Log Modal - Multi-step wellness check-in form
 */

import { useState } from 'react';
import { X, Plus, Minus, Heart, Sparkles, Mic, Check, Loader2 } from 'lucide-react';
import { HistoryLog, POSITIVE_TAGS, NEGATIVE_TAGS, capitalize, formatDate } from '../../components/history';
import { VoiceRecorder } from './VoiceRecorder';
import { BodySignalsSelector } from './BodySignalsSelector';
import { RatingSlider } from './RatingSlider';

interface WellnessLogModalProps {
  onClose: () => void;
  onSave: (log: Partial<HistoryLog>) => void;
  existingLog?: HistoryLog | null;
  selectedDate: string;
  isSaving: boolean;
}

export function WellnessLogModal({
  onClose,
  onSave,
  existingLog,
  selectedDate,
  isSaving,
}: WellnessLogModalProps): React.ReactElement {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState(existingLog?.mood || 7);
  const [energy, setEnergy] = useState(existingLog?.energy || 7);
  const [stress, setStress] = useState(existingLog?.stress || 4);
  const [sleepQuality, setSleepQuality] = useState(existingLog?.sleepQuality || 7);
  const [sleepHours, setSleepHours] = useState(existingLog?.sleepHours || 7);
  const [symptoms, setSymptoms] = useState<string[]>(existingLog?.symptoms || []);
  const [tags, setTags] = useState<string[]>(existingLog?.tags || []);
  const [notes, setNotes] = useState(existingLog?.notes || '');
  const [voiceNoteUrl, setVoiceNoteUrl] = useState(existingLog?.voiceNoteUrl || '');

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const formatSleepTime = (hours: number): string => {
    // Round to nearest 15 minutes (0.25 hours) to avoid floating point issues
    const roundedHours = Math.round(hours * 4) / 4;
    const h = Math.floor(roundedHours);
    const m = Math.round((roundedHours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0d0d12]/95 rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="relative p-5 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1.5">
              {existingLog ? 'Edit' : 'Log'} Wellness · {formatDate(selectedDate)}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1.5 w-6 rounded-full transition-all ${step >= s ? 'bg-violet-500/80' : 'bg-white/[0.06]'}`} />
                ))}
              </div>
              <span className="text-xs text-text-muted/60 font-medium">Step {step} of 3</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-text-muted hover:text-text-primary hover:bg-white/[0.08] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-5 space-y-3">
          {step === 1 && (
            <>
              <RatingSlider label="Mood" color="emerald" value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" />
              <RatingSlider label="Energy" color="amber" value={energy} onChange={setEnergy} lowLabel="Tired" highLabel="Energized" />
              <RatingSlider label="Stress" color="rose" value={stress} onChange={setStress} lowLabel="Calm" highLabel="Stressed" />
              <RatingSlider label="Sleep Quality" color="violet" value={sleepQuality} onChange={setSleepQuality} lowLabel="Poor" highLabel="Excellent" />

              {/* Sleep Hours */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                <button
                  onClick={() => setSleepHours(Math.max(3, sleepHours - 0.25))}
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-text-primary transition-all hover:bg-white/[0.08] active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <div className="text-center">
                  <span className="text-3xl font-bold text-text-primary">{formatSleepTime(sleepHours)}</span>
                  <span className="text-[10px] text-text-muted/60 block mt-1 uppercase tracking-wider font-medium">Sleep Duration</span>
                </div>
                <button
                  onClick={() => setSleepHours(Math.min(12, sleepHours + 0.25))}
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-text-primary transition-all hover:bg-white/[0.08] active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Positive Tags */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  What helped today?
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {POSITIVE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`py-2 rounded-lg text-xs font-medium text-center transition-all ${
                        tags.includes(tag)
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                          : 'bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06]'
                      }`}
                    >
                      {capitalize(tag)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Negative Tags */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Heart size={14} className="text-rose-400" />
                  What was challenging?
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {NEGATIVE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`py-2 rounded-lg text-xs font-medium text-center transition-all ${
                        tags.includes(tag)
                          ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                          : 'bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06]'
                      }`}
                    >
                      {capitalize(tag)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Signals (FDA-friendly) */}
              <BodySignalsSelector selected={symptoms} onChange={setSymptoms} />
            </>
          )}

          {step === 3 && (
            <>
              {/* Voice Note */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Mic size={14} className="text-rose-400" />
                  Voice Note (optional)
                </h4>
                <VoiceRecorder onRecordingComplete={setVoiceNoteUrl} />
              </div>

              {/* Text Notes */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h4 className="text-sm font-semibold text-text-primary">Notes (optional)</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How are you feeling? Any thoughts to capture..."
                  className="w-full h-28 px-4 py-3 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder-text-muted/50 resize-none focus:outline-none focus:border-violet-500/30 transition-colors"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="relative p-5 border-t border-white/[0.06]">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-3 rounded-xl font-semibold text-sm bg-white/[0.05] border border-white/[0.08] text-text-primary transition-all hover:bg-white/[0.08] active:scale-[0.98]"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-violet-500/20 border border-violet-500/30 text-violet-300 transition-all hover:bg-violet-500/25 active:scale-[0.98] backdrop-blur-sm"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => {
                  onSave({
                    date: selectedDate,
                    mood,
                    energy,
                    stress,
                    sleepQuality,
                    sleepHours,
                    symptoms,
                    tags,
                    notes,
                    voiceNoteUrl: voiceNoteUrl || undefined,
                  });
                }}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all hover:bg-emerald-500/25 active:scale-[0.98] backdrop-blur-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save Check-in
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
