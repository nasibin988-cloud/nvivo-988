/**
 * CaptureStep Component
 * Photo capture and upload interface
 * Note: Nutrition detail level selection moved to ReviewStep (shown AFTER analysis)
 */

import { Camera, Image, AlertCircle, CameraOff } from 'lucide-react';

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
}: CaptureStepProps): React.ReactElement {
  return (
    <div className="h-full flex flex-col">
      {/* Camera view */}
      <div className="relative aspect-[4/3] bg-black overflow-hidden">
        {imageData ? (
          <img src={imageData} alt="Food" className="w-full h-full object-cover" />
        ) : isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-500/[0.03] to-transparent">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-3">
              <Camera size={32} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-muted">No image selected</p>
          </div>
        )}

        {/* Corner guides */}
        {isStreaming && !imageData && (
          <>
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-violet-400/70 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-violet-400/70 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-violet-400/70 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-violet-400/70 rounded-br-lg" />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="p-4 flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-3 rounded-xl font-medium text-sm bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
        >
          <Image size={18} />
          Upload
        </button>
        {isStreaming ? (
          <>
            <button
              onClick={onStopCamera}
              className="py-3 px-4 rounded-xl font-medium text-sm bg-white/[0.04] border border-white/[0.08] text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-all flex items-center justify-center gap-2"
            >
              <CameraOff size={18} />
            </button>
            <button
              onClick={onCapturePhoto}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-violet-500/15 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              Capture
            </button>
          </>
        ) : (
          <button
            onClick={onStartCamera}
            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-violet-500/15 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            Open Camera
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileUpload}
        className="hidden"
      />
    </div>
  );
}
