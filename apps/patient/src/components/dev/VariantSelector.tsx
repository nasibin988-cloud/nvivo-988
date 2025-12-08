import { useState } from 'react';
import { X, Palette } from 'lucide-react';
import { useDesignVariants } from '../../contexts/DesignVariantContext';

/**
 * Development tool for switching between design variants
 * Shows a floating button that opens a variant selector panel
 */
export function VariantSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { variants, setHeaderVariant, setNavVariant, setAllVariants } =
    useDesignVariants();

  // Only show in development - check for development mode
  const isDev = !window.location.hostname.includes('nvivo.health');
  if (!isDev) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full bg-accent shadow-elevated flex items-center justify-center text-white hover:bg-accent/90 transition-base"
        aria-label="Open variant selector"
      >
        <Palette size={20} />
      </button>

      {/* Panel overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-6 pb-10 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Palette size={20} className="text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Design Variants</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-surface-2 transition-base"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            {/* Quick preset */}
            <div className="mb-6">
              <p className="text-sm text-text-secondary mb-3">Quick Preset</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAllVariants(v as 1 | 2 | 3 | 4)}
                    className={`py-3 px-4 rounded-theme font-medium text-sm transition-base ${
                      variants.header === v && variants.nav === v
                        ? 'bg-accent text-white'
                        : 'bg-surface-2 text-text-primary hover:bg-surface-3'
                    }`}
                  >
                    Style {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual controls */}
            <div className="space-y-5">
              {/* Header variant */}
              <div>
                <p className="text-sm text-text-secondary mb-2">Header Style</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((v) => (
                    <button
                      key={v}
                      onClick={() => setHeaderVariant(v as 1 | 2 | 3 | 4)}
                      className={`py-2.5 px-3 rounded-theme text-sm transition-base ${
                        variants.header === v
                          ? 'bg-accent text-white'
                          : 'bg-surface-2 text-text-primary hover:bg-surface-3 border border-border'
                      }`}
                    >
                      {v === 1 && 'Classic'}
                      {v === 2 && 'Hero'}
                      {v === 3 && 'Banner'}
                      {v === 4 && 'Card'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nav variant */}
              <div>
                <p className="text-sm text-text-secondary mb-2">Navigation Style</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((v) => (
                    <button
                      key={v}
                      onClick={() => setNavVariant(v as 1 | 2 | 3 | 4)}
                      className={`py-2.5 px-3 rounded-theme text-sm transition-base ${
                        variants.nav === v
                          ? 'bg-accent text-white'
                          : 'bg-surface-2 text-text-primary hover:bg-surface-3 border border-border'
                      }`}
                    >
                      {v === 1 && 'Stacked'}
                      {v === 2 && 'Pill'}
                      {v === 3 && 'Floating'}
                      {v === 4 && 'Minimal'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Current selection display */}
            <div className="mt-6 p-4 bg-surface-2 rounded-theme">
              <p className="text-xs text-text-secondary mb-2">Current Selection</p>
              <div className="flex gap-4 text-sm">
                <span className="text-text-primary">
                  Header: <span className="text-accent font-medium">{variants.header}</span>
                </span>
                <span className="text-text-primary">
                  Nav: <span className="text-accent font-medium">{variants.nav}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VariantSelector;
