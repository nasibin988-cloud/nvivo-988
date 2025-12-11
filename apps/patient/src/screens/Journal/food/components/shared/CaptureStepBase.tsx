/**
 * CaptureStepBase - Reusable camera/gallery capture component
 * Used by PhotoAnalysis and MenuScanner with different theming
 */

import { Camera, Image, AlertCircle, CameraOff, type LucideIcon } from 'lucide-react';

// Theme color mappings for Tailwind classes
const THEME_COLORS = {
  violet: {
    cornerBorder: 'border-violet-400/70',
    emptyGradient: 'from-violet-500/[0.03] to-transparent',
    emptyIcon: 'text-violet-400/40',
    primaryBtnBg: 'bg-violet-500/15',
    primaryBtnBorder: 'border-violet-500/30',
    primaryBtnText: 'text-violet-400',
    primaryBtnHover: 'hover:bg-violet-500/20',
    tipsAccent: 'text-violet-400',
    tipsBg: 'bg-violet-500/[0.06]',
    tipsBorder: 'border-violet-500/10',
  },
  teal: {
    cornerBorder: 'border-teal-400',
    emptyGradient: 'from-teal-500/[0.03] to-transparent',
    emptyIcon: 'text-teal-400/40',
    primaryBtnBg: 'bg-gradient-to-r from-teal-500/90 to-cyan-500/90',
    primaryBtnBorder: '',
    primaryBtnText: 'text-white',
    primaryBtnHover: 'shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30',
    tipsAccent: 'text-teal-400',
    tipsBg: 'bg-teal-500/[0.06]',
    tipsBorder: 'border-teal-500/10',
  },
  blue: {
    cornerBorder: 'border-blue-400/70',
    emptyGradient: 'from-blue-500/[0.03] to-transparent',
    emptyIcon: 'text-blue-400/40',
    primaryBtnBg: 'bg-blue-500/15',
    primaryBtnBorder: 'border-blue-500/30',
    primaryBtnText: 'text-blue-400',
    primaryBtnHover: 'hover:bg-blue-500/20',
    tipsAccent: 'text-blue-400',
    tipsBg: 'bg-blue-500/[0.06]',
    tipsBorder: 'border-blue-500/10',
  },
} as const;

type ThemeColor = keyof typeof THEME_COLORS;

interface CaptureStepBaseProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  imageData: string | null;
  error: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCapturePhoto: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  /** Theme color for styling */
  themeColor?: ThemeColor;
  /** Icon shown in empty state */
  emptyIcon?: LucideIcon;
  /** Primary text for empty state */
  emptyText?: string;
  /** Secondary text for empty state */
  emptySubtext?: string;
  /** Tips to display (optional) */
  tips?: string[];
  /** Label for capture button */
  captureLabel?: string;
  /** Use compact layout (no padding wrapper) */
  compact?: boolean;
  /** Show dashed border overlay when streaming */
  showDashedOverlay?: boolean;
}

export function CaptureStepBase({
  videoRef,
  isStreaming,
  imageData,
  error,
  onStartCamera,
  onStopCamera,
  onCapturePhoto,
  onFileUpload,
  fileInputRef,
  themeColor = 'violet',
  emptyIcon: EmptyIcon = Camera,
  emptyText = 'No image selected',
  emptySubtext,
  tips,
  captureLabel = 'Capture',
  compact = false,
  showDashedOverlay = false,
}: CaptureStepBaseProps): React.ReactElement {
  const colors = THEME_COLORS[themeColor];

  const content = (
    <>
      {/* Preview area */}
      <div className={`aspect-[4/3] ${compact ? 'rounded-2xl' : ''} overflow-hidden bg-black${compact ? '/40' : ''} ${compact ? 'border border-white/[0.06]' : ''} relative`}>
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
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${colors.emptyGradient}`}>
            <div className={compact ? '' : 'p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-3'}>
              <EmptyIcon size={compact ? 48 : 32} className={compact ? colors.emptyIcon : 'text-text-muted'} />
            </div>
            {!compact && <p className="text-sm text-text-muted">{emptyText}</p>}
            {compact && (
              <>
                <span className="text-sm mt-3">{emptyText}</span>
                {emptySubtext && <span className="text-xs mt-1 text-text-muted/60">{emptySubtext}</span>}
              </>
            )}
          </div>
        )}

        {/* Corner guides - only when streaming */}
        {isStreaming && !imageData && (
          showDashedOverlay ? (
            // Dashed overlay style (menu scanner)
            <div className={`absolute inset-4 border-2 border-dashed ${colors.cornerBorder.replace('/70', '/30')} rounded-xl pointer-events-none`}>
              <div className={`absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 ${colors.cornerBorder} rounded-tl`} />
              <div className={`absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 ${colors.cornerBorder} rounded-tr`} />
              <div className={`absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 ${colors.cornerBorder} rounded-bl`} />
              <div className={`absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 ${colors.cornerBorder} rounded-br`} />
            </div>
          ) : (
            // Simple corner guides (photo analysis)
            <>
              <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 ${colors.cornerBorder} rounded-tl-lg`} />
              <div className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 ${colors.cornerBorder} rounded-tr-lg`} />
              <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 ${colors.cornerBorder} rounded-bl-lg`} />
              <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 ${colors.cornerBorder} rounded-br-lg`} />
            </>
          )
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className={`${compact ? '' : 'mx-4 mt-3'} p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 flex items-start gap-3`}>
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">{error}</p>
        </div>
      )}

      {/* Tips section (optional) */}
      {tips && tips.length > 0 && (
        <div className={`${colors.tipsBg} rounded-xl p-4 border ${colors.tipsBorder}`}>
          <h4 className={`text-xs font-semibold ${colors.tipsAccent} uppercase tracking-wider mb-2`}>
            Tips for best results
          </h4>
          <ul className="text-xs text-text-secondary space-y-1.5">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className={colors.tipsAccent}>•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className={`${compact ? 'p-4' : ''} flex gap-3`}>
        {!isStreaming ? (
          // Not streaming - show camera + gallery buttons
          compact ? (
            // Compact layout (menu scanner style) - camera first, more prominent
            <>
              <button
                onClick={onStartCamera}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl ${colors.primaryBtnBg} ${colors.primaryBtnBorder} ${colors.primaryBtnText} font-semibold text-sm ${colors.primaryBtnHover} active:scale-[0.98] transition-all`}
              >
                <Camera size={18} />
                Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-primary font-semibold text-sm hover:bg-white/[0.06] active:scale-[0.98] transition-all"
              >
                <Image size={18} />
                Gallery
              </button>
            </>
          ) : (
            // Standard layout (photo analysis style) - upload first
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 rounded-xl font-medium text-sm bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
              >
                <Image size={18} />
                Upload
              </button>
              <button
                onClick={onStartCamera}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm ${colors.primaryBtnBg} ${colors.primaryBtnBorder} ${colors.primaryBtnText} ${colors.primaryBtnHover} transition-all flex items-center justify-center gap-2`}
              >
                <Camera size={18} />
                Open Camera
              </button>
            </>
          )
        ) : (
          // Streaming - show stop + capture buttons
          <>
            <button
              onClick={onStopCamera}
              className="py-3.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-muted hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.98] transition-all"
            >
              <CameraOff size={18} />
            </button>
            <button
              onClick={onCapturePhoto}
              className={`flex-1 flex items-center justify-center gap-2 py-${compact ? '4' : '3'} rounded-xl ${compact ? 'font-bold' : 'font-semibold'} text-sm ${colors.primaryBtnBg} ${colors.primaryBtnBorder} ${colors.primaryBtnText} ${colors.primaryBtnHover} active:scale-[0.98] transition-all`}
            >
              <Camera size={compact ? 20 : 18} />
              {captureLabel}
            </button>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileUpload}
        className="hidden"
      />
    </>
  );

  // Wrap in container if compact mode
  if (compact) {
    return <div className="p-5 space-y-5">{content}</div>;
  }

  return <div className="h-full flex flex-col">{content}</div>;
}
