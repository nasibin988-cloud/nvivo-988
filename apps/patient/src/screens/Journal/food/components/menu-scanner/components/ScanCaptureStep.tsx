/**
 * ScanCaptureStep - Camera/gallery capture for menu scanning
 * Uses shared CaptureStepBase with teal theme (matching Photo AI layout)
 */

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
      captureLabel="Capture Menu"
    />
  );
}
