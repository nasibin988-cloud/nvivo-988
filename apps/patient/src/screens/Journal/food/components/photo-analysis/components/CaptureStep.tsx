/**
 * CaptureStep Component
 * Photo capture and upload interface using shared CaptureStepBase
 * Note: Nutrition detail level selection moved to ReviewStep (shown AFTER analysis)
 */

import { CaptureStepBase } from '../../shared';

interface CaptureStepProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  imageData: string | null;
  error: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCapturePhoto: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  /** Extra content to render before action buttons */
  extraContent?: React.ReactNode;
}

export default function CaptureStep({
  videoRef,
  isStreaming,
  imageData,
  error,
  onStartCamera,
  onStopCamera,
  onCapturePhoto,
  onFileUpload,
  fileInputRef,
  extraContent,
}: CaptureStepProps): React.ReactElement {
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
      themeColor="violet"
      captureLabel="Capture"
      extraContent={extraContent}
    />
  );
}
