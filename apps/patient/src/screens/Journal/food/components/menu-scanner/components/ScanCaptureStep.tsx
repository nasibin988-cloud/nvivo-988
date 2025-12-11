/**
 * ScanCaptureStep - Camera/gallery capture for menu scanning
 * Uses shared CaptureStepBase with teal theme
 */

import { FileText } from 'lucide-react';
import { CaptureStepBase } from '../../shared';

interface ScanCaptureStepProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  imageData: string | null;
  error: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCapturePhoto: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const MENU_SCAN_TIPS = [
  'Hold camera steady and ensure good lighting',
  'Include menu item names and prices if visible',
  'Nutrition info will be estimated if not shown',
];

export function ScanCaptureStep({
  videoRef,
  isStreaming,
  imageData,
  error,
  onStartCamera,
  onStopCamera,
  onCapturePhoto,
  onFileUpload,
  fileInputRef,
}: ScanCaptureStepProps): React.ReactElement {
  return (
    <CaptureStepBase
      videoRef={videoRef}
      isStreaming={isStreaming}
      imageData={imageData}
      error={error}
      onStartCamera={onStartCamera}
      onStopCamera={onStopCamera}
      onCapturePhoto={onCapturePhoto}
      onFileUpload={onFileUpload}
      fileInputRef={fileInputRef}
      themeColor="teal"
      emptyIcon={FileText}
      emptyText="Point camera at menu"
      emptySubtext="or upload from gallery"
      tips={MENU_SCAN_TIPS}
      captureLabel="Capture Menu"
      compact
      showDashedOverlay
    />
  );
}
