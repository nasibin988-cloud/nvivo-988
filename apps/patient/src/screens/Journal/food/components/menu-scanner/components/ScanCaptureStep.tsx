/**
 * ScanCaptureStep - Camera/gallery capture for menu scanning
 */

import { Camera, Image, FileText } from 'lucide-react';

interface ScanCaptureStepProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  imageData: string | null;
  error: string | null;
  onStartCamera: () => void;
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
  onCapturePhoto,
  onFileUpload,
  fileInputRef,
}: ScanCaptureStepProps): React.ReactElement {
  return (
    <div className="p-5 space-y-5">
      {/* Preview area */}
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06] relative">
        {isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : imageData ? (
          <img
            src={imageData}
            alt="Captured menu"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
            <FileText size={48} className="text-teal-400/40 mb-3" />
            <span className="text-sm">Point camera at menu</span>
            <span className="text-xs mt-1 text-text-muted/60">or upload from gallery</span>
          </div>
        )}

        {/* Scanning guide overlay */}
        {isStreaming && (
          <div className="absolute inset-4 border-2 border-dashed border-teal-400/30 rounded-xl pointer-events-none">
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Tips */}
      <div className="bg-teal-500/[0.06] rounded-xl p-4 border border-teal-500/10">
        <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2">
          Tips for best results
        </h4>
        <ul className="text-xs text-text-secondary space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-teal-400">•</span>
            Hold camera steady and ensure good lighting
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-400">•</span>
            Include menu item names and prices if visible
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-400">•</span>
            Nutrition info will be estimated if not shown
          </li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {!isStreaming ? (
          <>
            <button
              onClick={onStartCamera}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-500/90 to-cyan-500/90 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 active:scale-[0.98] transition-all"
            >
              <Camera size={18} />
              Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-primary font-semibold text-sm hover:bg-white/[0.06] active:scale-[0.98] transition-all"
            >
              <Image size={18} />
              Gallery
            </button>
          </>
        ) : (
          <button
            onClick={onCapturePhoto}
            className="col-span-2 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-teal-500/90 to-cyan-500/90 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 active:scale-[0.98] transition-all"
          >
            <Camera size={20} />
            Capture Menu
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileUpload}
        className="hidden"
      />
    </div>
  );
}
