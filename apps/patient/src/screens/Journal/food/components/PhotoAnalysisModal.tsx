/**
 * Photo Analysis Modal
 * AI-powered food photo analysis using GPT-4 Vision
 * Detail level is selected BEFORE analysis to optimize AI usage
 */

import { useRef } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import {
  type PhotoAnalysisModalProps,
  useCamera,
  usePhotoAnalysis,
  CaptureStep,
  AnalyzingStep,
  ReviewStep,
} from './photo-analysis';

export default function PhotoAnalysisModal({ onClose, onConfirm }: PhotoAnalysisModalProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    videoRef,
    isStreaming,
    startCamera,
    capturePhoto,
    cameraError,
  } = useCamera();

  const {
    step,
    imageData,
    result,
    error,
    selectedMealType,
    eatenAt,
    editingItem,
    detailLevel,
    setImageData,
    analyzeImage,
    handleRetry,
    handleUpdateItem,
    handleRemoveItem,
    handlePortionChange,
    setSelectedMealType,
    setEatenAt,
    setEditingItem,
    setDetailLevel,
    getConfirmResult,
  } = usePhotoAnalysis();

  const handleCapturePhoto = (): void => {
    const base64 = capturePhoto();
    if (base64) {
      setImageData(base64);
      analyzeImage(base64);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageData(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = (): void => {
    const confirmResult = getConfirmResult();
    if (confirmResult) {
      onConfirm(confirmResult);
      onClose();
    }
  };

  const getStepDescription = (): string => {
    switch (step) {
      case 'capture':
        return 'Select detail level & take photo';
      case 'analyzing':
        return `Analyzing (${detailLevel} mode)...`;
      case 'review':
        return 'Review & adjust';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl border border-white/[0.08] overflow-hidden max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex justify-between items-center shrink-0 bg-gradient-to-r from-violet-500/[0.08] via-purple-500/[0.05] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/90 to-purple-600/90 text-white shadow-lg shadow-violet-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Photo AI</h2>
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
            <CaptureStep
              videoRef={videoRef}
              isStreaming={isStreaming}
              imageData={imageData}
              error={error || cameraError}
              detailLevel={detailLevel}
              onDetailLevelChange={setDetailLevel}
              onStartCamera={startCamera}
              onCapturePhoto={handleCapturePhoto}
              onFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
            />
          )}

          {step === 'analyzing' && imageData && (
            <AnalyzingStep imageData={imageData} />
          )}

          {step === 'review' && result && imageData && (
            <ReviewStep
              imageData={imageData}
              result={result}
              selectedMealType={selectedMealType}
              eatenAt={eatenAt}
              editingItem={editingItem}
              onRetry={handleRetry}
              onMealTypeChange={setSelectedMealType}
              onTimeChange={setEatenAt}
              onToggleEdit={setEditingItem}
              onUpdateItem={handleUpdateItem}
              onPortionChange={handlePortionChange}
              onRemoveItem={handleRemoveItem}
            />
          )}
        </div>

        {/* Footer */}
        {step === 'review' && (
          <div className="p-4 border-t border-white/[0.06] bg-white/[0.01] shrink-0">
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white/[0.06] border border-emerald-500/30 text-emerald-400 transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Add to Food Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
