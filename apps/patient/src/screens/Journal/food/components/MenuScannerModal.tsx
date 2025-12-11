/**
 * Menu Scanner Modal
 * AI-powered restaurant menu OCR scanning with nutrition estimation
 */

import { useRef } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { useCamera } from './photo-analysis/hooks';
import {
  useMenuScanner,
  ScanCaptureStep,
  ScanningStep,
  ReviewStep,
  type MenuItem,
} from './menu-scanner';

interface MenuScannerModalProps {
  onClose: () => void;
  onConfirm: (items: MenuItem[]) => void;
}

export default function MenuScannerModal({
  onClose,
  onConfirm,
}: MenuScannerModalProps): React.ReactElement {
  // Use non-null assertion pattern for refs passed to child components
  const fileInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const {
    videoRef,
    isStreaming,
    startCamera,
    stopCamera,
    capturePhoto,
    cameraError,
  } = useCamera();

  const {
    step,
    imageData,
    result,
    error,
    selectedItems,
    setImageData,
    scanMenu,
    handleRetry,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    updateItemNutrition,
    getSelectedItems,
  } = useMenuScanner();

  const handleCapturePhoto = (): void => {
    const base64 = capturePhoto();
    if (base64) {
      setImageData(base64);
      scanMenu(base64);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageData(base64);
      scanMenu(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = (): void => {
    const items = getSelectedItems();
    if (items.length > 0) {
      onConfirm(items);
      onClose();
    }
  };

  const getStepDescription = (): string => {
    switch (step) {
      case 'capture':
        return 'Scan a restaurant menu';
      case 'scanning':
        return 'Reading menu...';
      case 'review':
        return 'Select items to log';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl border border-white/[0.08] overflow-hidden max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex justify-between items-center shrink-0 bg-gradient-to-r from-teal-500/[0.08] via-cyan-500/[0.05] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500/90 to-cyan-600/90 text-white shadow-lg shadow-teal-500/20">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Menu Scanner</h2>
              <p className="text-xs text-text-muted">{getStepDescription()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'capture' && (
            <ScanCaptureStep
              videoRef={videoRef}
              isStreaming={isStreaming}
              imageData={imageData}
              error={error || cameraError}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
              onCapturePhoto={handleCapturePhoto}
              onFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
            />
          )}

          {step === 'scanning' && imageData && (
            <ScanningStep imageData={imageData} />
          )}

          {step === 'review' && result && imageData && (
            <ReviewStep
              imageData={imageData}
              result={result}
              selectedCount={selectedItems.length}
              onRetry={handleRetry}
              onToggleItem={toggleItemSelection}
              onSelectAll={selectAllItems}
              onDeselectAll={deselectAllItems}
              onUpdateItem={updateItemNutrition}
            />
          )}
        </div>

        {/* Footer */}
        {step === 'review' && (
          <div className="p-4 border-t border-white/[0.06] bg-white/[0.01] shrink-0">
            <button
              onClick={handleConfirm}
              disabled={selectedItems.length === 0}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white/[0.06] border border-teal-500/30 text-teal-400 transition-all duration-300 hover:bg-teal-500/10 hover:border-teal-500/40 hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={16} />
              Add {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''} to Food Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
