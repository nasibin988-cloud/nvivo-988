/**
 * Scheduler Tab
 * Request-based scheduling: Patient indicates availability, care team offers slots
 */

import { useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Phone,
  X,
  Check,
  AlertCircle,
  Plus,
  Send,
  FileText,
  Sun,
  Sunset,
  Moon,
  CheckCircle,
  Hourglass,
  CalendarCheck,
} from 'lucide-react';

// Mock providers from care team
const providers = [
  {
    id: '1',
    name: 'Dr. Elizabeth Warren',
    title: 'Primary Care Physician',
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '2',
    name: 'Dr. Michael Anderson',
    title: 'Cardiologist',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '3',
    name: 'Dr. Robert Campbell',
    title: 'Psychologist',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '4',
    name: 'Dr. Jennifer Collins',
    title: 'Nutritionist',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80',
  },
];

const appointmentTypes = [
  { id: 'checkup', label: 'Regular Check-up', duration: '30 min' },
  { id: 'followup', label: 'Follow-up Visit', duration: '20 min' },
  { id: 'consultation', label: 'Consultation', duration: '45 min' },
  { id: 'urgent', label: 'Urgent Care', duration: '30 min' },
];

const visitTypes = [
  { id: 'video', label: 'Video Call', icon: Video },
  { id: 'inperson', label: 'In-Person', icon: MapPin },
  { id: 'phone', label: 'Phone Call', icon: Phone },
];

const timePreferences = [
  { id: 'morning', label: 'Morning', description: '8am - 12pm', icon: Sun },
  { id: 'afternoon', label: 'Afternoon', description: '12pm - 5pm', icon: Sunset },
  { id: 'evening', label: 'Evening', description: '5pm - 8pm', icon: Moon },
  { id: 'anytime', label: 'Any Time', description: 'Flexible', icon: Clock },
];

// Mock appointment requests with different statuses
const mockRequests = [
  {
    id: '1',
    provider: 'Dr. Elizabeth Warren',
    title: 'Primary Care Physician',
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80',
    type: 'Regular Check-up',
    visitType: 'inperson',
    status: 'confirmed' as const,
    confirmedDate: '12/15/24',
    confirmedTime: '10:00 AM',
  },
  {
    id: '2',
    provider: 'Dr. Michael Anderson',
    title: 'Cardiologist',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80',
    type: 'Follow-up Visit',
    visitType: 'video',
    status: 'offered' as const,
    offeredSlots: [
      { id: 's1', date: '12/10/24', time: '2:00 PM' },
      { id: 's2', date: '12/11/24', time: '10:30 AM' },
      { id: 's3', date: '12/12/24', time: '3:30 PM' },
    ],
  },
  {
    id: '3',
    provider: 'Dr. Jennifer Collins',
    title: 'Nutritionist',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80',
    type: 'Consultation',
    visitType: 'video',
    status: 'pending' as const,
    submittedDate: '12/06/24',
  },
];

type RequestStep = 'list' | 'provider' | 'type' | 'availability' | 'questions' | 'review' | 'success';

interface AvailabilitySlot {
  date: Date;
  timePreference: string;
}

interface RequestData {
  providerId: string | null;
  appointmentType: string | null;
  visitType: string;
  availability: AvailabilitySlot[];
  reason: string;
  currentConcerns: string;
  medicationChanges: string;
  additionalNotes: string;
}

export default function SchedulerTab() {
  const [step, setStep] = useState<RequestStep>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requestData, setRequestData] = useState<RequestData>({
    providerId: null,
    appointmentType: null,
    visitType: 'video',
    availability: [],
    reason: '',
    currentConcerns: '',
    medicationChanges: '',
    additionalNotes: '',
  });
  const [, setSelectedSlotId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [showSlotModal, setShowSlotModal] = useState<string | null>(null);

  const resetRequest = () => {
    setStep('list');
    setRequestData({
      providerId: null,
      appointmentType: null,
      visitType: 'video',
      availability: [],
      reason: '',
      currentConcerns: '',
      medicationChanges: '',
      additionalNotes: '',
    });
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isDateSelectable = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date) return false;
    return requestData.availability.some(
      (a) => a.date.toDateString() === date.toDateString()
    );
  };

  const toggleDateSelection = (date: Date) => {
    const existingIndex = requestData.availability.findIndex(
      (a) => a.date.toDateString() === date.toDateString()
    );

    if (existingIndex >= 0) {
      // Remove date
      setRequestData({
        ...requestData,
        availability: requestData.availability.filter((_, i) => i !== existingIndex),
      });
    } else {
      // Add date with default time preference
      setRequestData({
        ...requestData,
        availability: [...requestData.availability, { date, timePreference: 'anytime' }],
      });
    }
  };

  const updateTimePreference = (date: Date, timePreference: string) => {
    setRequestData({
      ...requestData,
      availability: requestData.availability.map((a) =>
        a.date.toDateString() === date.toDateString() ? { ...a, timePreference } : a
      ),
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  };

  const provider = providers.find((p) => p.id === requestData.providerId);
  const appointmentType = appointmentTypes.find((t) => t.id === requestData.appointmentType);

  // Provider selection step
  if (step === 'provider') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={resetRequest}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-medium text-text-primary">Select Provider</h3>
            <p className="text-xs text-text-muted">Who would you like to see?</p>
          </div>
        </div>

        <div className="space-y-2">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setRequestData({ ...requestData, providerId: p.id });
                setStep('type');
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface border border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08] transition-all group"
            >
              <img
                src={p.avatarUrl}
                alt={p.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-white/10"
              />
              <div className="flex-1 text-left">
                <h4 className="font-medium text-text-primary">{p.name}</h4>
                <span className="inline-block px-2 py-0.5 mt-1 rounded-full bg-white/[0.04] text-xs text-text-muted">
                  {p.title}
                </span>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-text-secondary" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Appointment type selection step
  if (step === 'type') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setStep('provider')}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-medium text-text-primary">Appointment Type</h3>
            <p className="text-xs text-text-muted">What kind of visit do you need?</p>
          </div>
        </div>

        {/* Selected provider preview */}
        {provider && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/[0.08] border border-blue-500/20 mb-4">
            <img src={provider.avatarUrl} alt={provider.name} className="w-8 h-8 rounded-full" />
            <span className="text-sm text-text-primary">{provider.name}</span>
          </div>
        )}

        {/* Appointment types */}
        <div className="space-y-2">
          {appointmentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setRequestData({ ...requestData, appointmentType: type.id });
                setStep('availability');
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface border border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                <FileText size={18} className="text-text-secondary" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-text-primary">{type.label}</h4>
                <span className="text-xs text-text-muted">{type.duration}</span>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-text-secondary" />
            </button>
          ))}
        </div>

        {/* Visit type selection */}
        <div className="mt-6">
          <p className="text-sm text-text-secondary mb-3">Preferred Visit Format</p>
          <div className="flex gap-2">
            {visitTypes.map((vt) => {
              const Icon = vt.icon;
              const isSelected = requestData.visitType === vt.id;
              return (
                <button
                  key={vt.id}
                  onClick={() => setRequestData({ ...requestData, visitType: vt.id })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                      : 'bg-surface border-white/[0.04] text-text-secondary hover:bg-surface-2'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{vt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Availability selection step
  if (step === 'availability') {
    const days = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
          {/* Month navigation */}
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

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs text-text-muted py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) return <div key={i} />;

              const isSelectable = isDateSelectable(date);
              const isSelected = isDateSelected(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={i}
                  onClick={() => isSelectable && toggleDateSelection(date)}
                  disabled={!isSelectable}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                      : isToday
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        : isSelectable
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
            {requestData.availability
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((slot) => (
                <div
                  key={slot.date.toISOString()}
                  className="p-3 rounded-xl bg-surface border border-white/[0.04]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-400" />
                      <span className="text-sm text-text-primary font-medium">
                        {formatDate(slot.date)}
                      </span>
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

  // Pre-visit questions step
  if (step === 'questions') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setStep('availability')}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-medium text-text-primary">Pre-Visit Information</h3>
            <p className="text-xs text-text-muted">Help your provider prepare for your visit</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Reason for visit */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Reason for Visit <span className="text-red-400">*</span>
            </label>
            <textarea
              value={requestData.reason}
              onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
              placeholder="Briefly describe why you need this appointment..."
              className="w-full px-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 resize-none"
              rows={3}
            />
          </div>

          {/* Current concerns */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Current Symptoms or Concerns</label>
            <textarea
              value={requestData.currentConcerns}
              onChange={(e) => setRequestData({ ...requestData, currentConcerns: e.target.value })}
              placeholder="Any new or ongoing symptoms you'd like to discuss..."
              className="w-full px-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 resize-none"
              rows={3}
            />
          </div>

          {/* Medication changes */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Medication Updates</label>
            <textarea
              value={requestData.medicationChanges}
              onChange={(e) => setRequestData({ ...requestData, medicationChanges: e.target.value })}
              placeholder="Any changes to medications, new side effects, or refill needs..."
              className="w-full px-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 resize-none"
              rows={3}
            />
          </div>

          {/* Additional notes */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Additional Notes</label>
            <textarea
              value={requestData.additionalNotes}
              onChange={(e) => setRequestData({ ...requestData, additionalNotes: e.target.value })}
              placeholder="Anything else your provider should know..."
              className="w-full px-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={() => setStep('review')}
          disabled={!requestData.reason.trim()}
          className={`w-full py-3.5 rounded-xl font-medium transition-all ${
            requestData.reason.trim()
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:scale-[1.01]'
              : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
          }`}
        >
          Review Request
        </button>
      </div>
    );
  }

  // Review step
  if (step === 'review') {
    const visitType = visitTypes.find((v) => v.id === requestData.visitType);
    const VisitIcon = visitType?.icon || Video;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setStep('questions')}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-medium text-text-primary">Review Your Request</h3>
            <p className="text-xs text-text-muted">Confirm before submitting</p>
          </div>
        </div>

        {/* Request summary */}
        <div className="relative bg-gradient-to-br from-blue-500/[0.08] to-surface rounded-2xl border border-blue-500/15 p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative space-y-4">
            {/* Provider */}
            {provider && (
              <div className="flex items-center gap-4">
                <img
                  src={provider.avatarUrl}
                  alt={provider.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10"
                />
                <div>
                  <h4 className="font-medium text-text-primary">{provider.name}</h4>
                  <span className="inline-block px-2.5 py-1 mt-1 rounded-full bg-white/[0.04] text-xs text-text-secondary">
                    {provider.title}
                  </span>
                </div>
              </div>
            )}

            <div className="h-px bg-white/[0.06]" />

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                <FileText size={16} className="text-blue-400" />
                <div>
                  <p className="text-xs text-text-muted">Type</p>
                  <p className="text-sm text-text-primary font-medium">{appointmentType?.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                <VisitIcon size={16} className="text-blue-400" />
                <div>
                  <p className="text-xs text-text-muted">Format</p>
                  <p className="text-sm text-text-primary font-medium">{visitType?.label}</p>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-emerald-400" />
                <p className="text-xs text-text-muted">Your Availability</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {requestData.availability.map((slot) => {
                  const tp = timePreferences.find((t) => t.id === slot.timePreference);
                  return (
                    <span
                      key={slot.date.toISOString()}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400"
                    >
                      {formatShortDate(slot.date)} ({tp?.label})
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Reason */}
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <p className="text-xs text-text-muted mb-1">Reason for Visit</p>
              <p className="text-sm text-text-primary">{requestData.reason}</p>
            </div>

            {requestData.currentConcerns && (
              <div className="p-3 rounded-xl bg-white/[0.03]">
                <p className="text-xs text-text-muted mb-1">Current Concerns</p>
                <p className="text-sm text-text-secondary">{requestData.currentConcerns}</p>
              </div>
            )}
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
          <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-400/90">
            After submitting, our scheduling team will review your request and offer you available
            time slots within 1-2 business days.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetRequest}
            className="flex-1 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => setStep('success')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:scale-[1.01] transition-all"
          >
            <Send size={16} />
            Submit Request
          </button>
        </div>
      </div>
    );
  }

  // Success step
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.4)]">
            <Check size={40} className="text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-emerald-500/20 animate-ping" />
        </div>

        <h3 className="text-xl font-semibold text-text-primary mb-2">Request Submitted</h3>
        <p className="text-text-secondary mb-6 max-w-xs">
          Your appointment request has been sent to {provider?.name}. You'll receive slot
          options within 1-2 business days.
        </p>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.1] border border-blue-500/20 text-blue-400 text-sm mb-8">
          <Hourglass size={16} />
          <span>Awaiting slot offers</span>
        </div>

        <button
          onClick={resetRequest}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all"
        >
          Back to Schedule
        </button>
      </div>
    );
  }

  // Main list view
  const pendingRequests = mockRequests.filter((r) => r.status === 'pending');
  const offeredRequests = mockRequests.filter((r) => r.status === 'offered');
  const confirmedRequests = mockRequests.filter((r) => r.status === 'confirmed');

  return (
    <div className="space-y-6">
      {/* Request New Appointment Button */}
      <button
        onClick={() => setStep('provider')}
        className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-2 border border-white/[0.08] p-4 hover:border-white/[0.15] hover:bg-surface-2 transition-all group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.08] via-transparent to-info/[0.05] opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent/[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
            <Plus size={18} className="text-accent" />
          </div>
          <span className="text-text-primary font-medium">Request Appointment</span>
        </div>
      </button>

      {/* Offered Slots - Action Required */}
      {offeredRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-medium text-amber-400">Action Required</h3>
          </div>

          {offeredRequests.map((req) => (
            <div
              key={req.id}
              className="relative rounded-2xl bg-gradient-to-br from-amber-500/[0.06] to-surface border border-amber-500/15 p-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-amber-500/[0.02]" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={req.avatarUrl}
                    alt={req.provider}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary text-sm">{req.provider}</h4>
                    <span className="inline-block px-2 py-0.5 mt-1 rounded-full bg-white/[0.04] text-xs text-text-muted">
                      {req.type}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-xs text-amber-400 font-medium">
                    Choose Slot
                  </span>
                </div>

                <p className="text-xs text-text-muted mb-3">
                  Select one of the offered time slots:
                </p>

                <div className="space-y-2">
                  {req.offeredSlots?.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setShowSlotModal(req.id);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-2/50 border border-white/[0.04] hover:bg-surface-2 hover:border-amber-500/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-text-muted" />
                        <span className="text-sm text-text-primary">{slot.date}</span>
                        <span className="text-text-muted">•</span>
                        <Clock size={14} className="text-text-muted" />
                        <span className="text-sm text-text-primary">{slot.time}</span>
                      </div>
                      <CheckCircle
                        size={18}
                        className="text-text-muted group-hover:text-amber-400 transition-colors"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmed Appointments */}
      {confirmedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary px-1">Confirmed Appointments</h3>

          {confirmedRequests.map((req) => (
            <div
              key={req.id}
              className="relative rounded-2xl bg-surface border border-white/[0.04] p-4 hover:bg-surface-2 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={req.avatarUrl}
                    alt={req.provider}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5"
                  />
                  {req.visitType === 'video' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-surface flex items-center justify-center">
                      <Video size={10} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-text-primary text-sm">{req.provider}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-[10px] text-emerald-400 font-medium">
                      Confirmed
                    </span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-white/[0.04] text-xs text-text-muted mb-2">
                    {req.type}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-text-muted" />
                      <span className="text-xs text-text-secondary">{req.confirmedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-text-muted" />
                      <span className="text-xs text-text-secondary">{req.confirmedTime}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCancelModal(req.id)}
                  className="p-2 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary px-1">Pending Requests</h3>

          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="relative rounded-2xl bg-surface border border-white/[0.04] p-4 group"
            >
              <div className="flex items-start gap-4">
                <img
                  src={req.avatarUrl}
                  alt={req.provider}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-text-primary text-sm">{req.provider}</h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-text-muted">
                      <Hourglass size={10} />
                      Pending
                    </span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-white/[0.04] text-xs text-text-muted mb-2">
                    {req.type}
                  </span>
                  <p className="text-xs text-text-muted">
                    Submitted {req.submittedDate} • Awaiting slot offers
                  </p>
                </div>

                <button
                  onClick={() => setShowCancelModal(req.id)}
                  className="p-2 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slot Confirmation Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-sm w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary text-center mb-2">
              Confirm This Slot?
            </h3>
            <p className="text-sm text-text-secondary text-center mb-6">
              Once confirmed, your appointment will be scheduled for this time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSlotModal(null);
                  setSelectedSlotId(null);
                }}
                className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowSlotModal(null);
                  setSelectedSlotId(null);
                  // Would mark as confirmed in real implementation
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-sm w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary text-center mb-2">
              Cancel Appointment?
            </h3>
            <p className="text-sm text-text-secondary text-center mb-6">
              Are you sure you want to cancel this appointment request? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
              >
                Keep It
              </button>
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
