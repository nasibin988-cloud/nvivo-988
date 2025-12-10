/**
 * Scheduler Tab
 * Request-based scheduling: Patient indicates availability, care team offers slots
 */

import { useState } from 'react';
import {
  type RequestStep,
  type RequestData,
  initialRequestData,
  mockRequests,
  ProviderStep,
  TypeStep,
  AvailabilityStep,
  QuestionsStep,
  ReviewStep,
  SuccessStep,
  RequestButton,
  OfferedRequests,
  ConfirmedRequests,
  PendingRequests,
  SlotConfirmationModal,
  CancelModal,
} from './scheduler';

export default function SchedulerTab(): React.ReactElement {
  const [step, setStep] = useState<RequestStep>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requestData, setRequestData] = useState<RequestData>(initialRequestData);
  const [, setSelectedSlotId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [showSlotModal, setShowSlotModal] = useState<string | null>(null);

  const resetRequest = (): void => {
    setStep('list');
    setRequestData(initialRequestData);
  };

  const handleSelectSlot = (requestId: string, slotId: string): void => {
    setSelectedSlotId(slotId);
    setShowSlotModal(requestId);
  };

  const handleSlotConfirm = (): void => {
    setShowSlotModal(null);
    setSelectedSlotId(null);
    // Would mark as confirmed in real implementation
  };

  const handleSlotClose = (): void => {
    setShowSlotModal(null);
    setSelectedSlotId(null);
  };

  const handleCancelConfirm = (): void => {
    setShowCancelModal(null);
    // Would remove request in real implementation
  };

  // Provider selection step
  if (step === 'provider') {
    return (
      <ProviderStep
        requestData={requestData}
        setRequestData={setRequestData}
        setStep={setStep}
        onReset={resetRequest}
      />
    );
  }

  // Appointment type selection step
  if (step === 'type') {
    return (
      <TypeStep
        requestData={requestData}
        setRequestData={setRequestData}
        setStep={setStep}
      />
    );
  }

  // Availability selection step
  if (step === 'availability') {
    return (
      <AvailabilityStep
        requestData={requestData}
        setRequestData={setRequestData}
        setStep={setStep}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />
    );
  }

  // Pre-visit questions step
  if (step === 'questions') {
    return (
      <QuestionsStep
        requestData={requestData}
        setRequestData={setRequestData}
        setStep={setStep}
      />
    );
  }

  // Review step
  if (step === 'review') {
    return (
      <ReviewStep
        requestData={requestData}
        setStep={setStep}
        onReset={resetRequest}
      />
    );
  }

  // Success step
  if (step === 'success') {
    return <SuccessStep requestData={requestData} onReset={resetRequest} />;
  }

  // Main list view
  const pendingRequests = mockRequests.filter((r) => r.status === 'pending');
  const offeredRequests = mockRequests.filter((r) => r.status === 'offered');
  const confirmedRequests = mockRequests.filter((r) => r.status === 'confirmed');

  return (
    <div className="space-y-6">
      <RequestButton onClick={() => setStep('provider')} />

      <OfferedRequests requests={offeredRequests} onSelectSlot={handleSelectSlot} />

      <ConfirmedRequests
        requests={confirmedRequests}
        onCancel={(id) => setShowCancelModal(id)}
      />

      <PendingRequests requests={pendingRequests} onCancel={(id) => setShowCancelModal(id)} />

      {showSlotModal && (
        <SlotConfirmationModal onClose={handleSlotClose} onConfirm={handleSlotConfirm} />
      )}

      {showCancelModal && (
        <CancelModal
          onClose={() => setShowCancelModal(null)}
          onConfirm={handleCancelConfirm}
        />
      )}
    </div>
  );
}
