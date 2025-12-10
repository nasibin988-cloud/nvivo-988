/**
 * CaptureStep Component
 * Photo capture and upload interface
 */

import { Camera, Upload, AlertCircle } from 'lucide-react';

interface CaptureStepProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  imageData: string | null;
  error: string | null;
  onStartCamera: () => void;
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
  onCapturePhoto,
  onFileUpload,
  fileInputRef,
}: CaptureStepProps): React.ReactElement {
  return (
    <div className="p-5 space-y-4">
      {/* Camera preview or placeholder */}
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.02] to-white/[0.01] border border-white/[0.06] relative">
        {isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : imageData ? (
          <img src={imageData} alt="Food" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-500/[0.03] to-transparent">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-3">
              <Camera size={32} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-muted">No image selected</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={isStreaming ? onCapturePhoto : onStartCamera}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.06] border border-violet-500/30 text-violet-400 font-semibold hover:bg-violet-500/10 hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] active:scale-[0.98] transition-all duration-300"
        >
          <Camera size={20} />
          {isStreaming ? 'Capture' : 'Open Camera'}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-text-primary font-semibold hover:bg-white/[0.06] hover:border-white/[0.1] active:scale-[0.98] transition-all duration-300"
        >
          <Upload size={20} />
          Upload Photo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileUpload}
        className="hidden"
      />

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-400" />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}
    </div>
  );
}
