/**
 * AvailabilityStep Component
 * Select available dates and time preferences
 */

import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { providers, appointmentTypes, timePreferences } from '../data';
import { getDaysInMonth, isDateSelectable, isDateSelected, formatDate, getMonthName } from '../utils';
import type { RequestData, RequestStep, AvailabilitySlot } from '../types';

interface AvailabilityStepProps {
  requestData: RequestData;
  setRequestData: (data: RequestData) => void;
  setStep: (step: RequestStep) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

export default function AvailabilityStep({
  requestData,
  setRequestData,
  setStep,
  currentMonth,
  setCurrentMonth,
}: AvailabilityStepProps): React.ReactElement {
  const days = getDaysInMonth(currentMonth);
  const monthName = getMonthName(currentMonth);
  const provider = providers.find((p) => p.id === requestData.providerId);
  const appointmentType = appointmentTypes.find((t) => t.id === requestData.appointmentType);

  const toggleDateSelection = (date: Date): void => {
    const existingIndex = requestData.availability.findIndex(
      (a) => a.date.toDateString() === date.toDateString()
    );

    if (existingIndex >= 0) {
      setRequestData({
        ...requestData,
        availability: requestData.availability.filter((_, i) => i !== existingIndex),
      });
    } else {
      setRequestData({
        ...requestData,
        availability: [...requestData.availability, { date, timePreference: 'anytime' }],
      });
    }
  };

  const updateTimePreference = (date: Date, timePreference: string): void => {
    setRequestData({
      ...requestData,
      availability: requestData.availability.map((a) =>
        a.date.toDateString() === date.toDateString() ? { ...a, timePreference } : a
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setStep('type')}
          className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h3 className="font-medium text-text-primary">Your Availability</h3>
          <p className="text-xs text-text-muted">Select dates when you are free</p>
        </div>
      </div>

      {/* Selection summary */}
      {provider && appointmentType && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/[0.08] border border-blue-500/20 mb-4">
          <img src={provider.avatarUrl} alt={provider.name} className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <span className="text-sm text-text-primary">{provider.name}</span>
            <span className="text-xs text-text-muted ml-2">• {appointmentType.label}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <p className="text-xs text-text-muted">
          Select all the dates that work for you. Our scheduling team will find the best
          available slot and offer you specific times.
        </p>
      </div>

      {/* Calendar */}
      <div className="bg-surface rounded-2xl border border-white/[0.04] p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-medium text-text-primary">{monthName}</span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs text-text-muted py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) return <div key={i} />;

            const selectable = isDateSelectable(date);
            const selected = isDateSelected(date, requestData.availability);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button
                key={i}
                onClick={() => selectable && toggleDateSelection(date)}
                disabled={!selectable}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                  selected
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                    : isToday
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : selectable
                        ? 'hover:bg-white/[0.06] text-text-primary'
                        : 'text-text-muted/40 cursor-not-allowed'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected dates with time preferences */}
      {requestData.availability.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">Selected Dates & Time Preferences</p>
          {[...requestData.availability]
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((slot: AvailabilitySlot) => (
              <div key={slot.date.toISOString()} className="p-3 rounded-xl bg-surface border border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-400" />
                    <span className="text-sm text-text-primary font-medium">{formatDate(slot.date)}</span>
                  </div>
                  <button
                    onClick={() => toggleDateSelection(slot.date)}
                    className="p-1 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {timePreferences.map((tp) => {
                    const Icon = tp.icon;
                    const isSelected = slot.timePreference === tp.id;
                    return (
                      <button
                        key={tp.id}
                        onClick={() => updateTimePreference(slot.date, tp.id)}
                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                            : 'bg-white/[0.02] border border-white/[0.04] text-text-muted hover:text-text-secondary'
                        }`}
                      >
                        <Icon size={12} />
                        <span>{tp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Continue button */}
      {requestData.availability.length > 0 && (
        <button
          onClick={() => setStep('questions')}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:scale-[1.01] transition-all"
        >
          Continue
        </button>
      )}
    </div>
  );
}
