/**
 * BarcodeScannerView - Camera-based barcode scanning UI
 */

import { useState, useRef } from 'react';
import { Camera, X, Loader2, AlertCircle, Barcode, Package, CheckCircle } from 'lucide-react';
import type { BarcodeProduct } from '../types';

interface BarcodeScannerViewProps {
  isScanning: boolean;
  isLookingUp: boolean;
  product: BarcodeProduct | null;
  error: string | null;
  recentScans: BarcodeProduct[];
  onStartScanning: () => void;
  onStopScanning: () => void;
  onLookup: (barcode: string) => void;
  onAddProduct: (product: BarcodeProduct) => void;
  onClear: () => void;
}

export function BarcodeScannerView({
  isScanning,
  isLookingUp,
  product,
  error,
  recentScans,
  onStartScanning,
  onStopScanning,
  onLookup,
  onAddProduct,
  onClear,
}: BarcodeScannerViewProps): React.ReactElement {
  const [manualBarcode, setManualBarcode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Demo barcodes for testing
  const DEMO_BARCODES = [
    { code: '5000159407236', name: 'Cadbury Dairy Milk' },
    { code: '038000138416', name: "Kellogg's Special K" },
    { code: '041270884181', name: 'Chobani Greek Yogurt' },
    { code: '016000275287', name: 'Nature Valley Bar' },
  ];

  const handleManualLookup = () => {
    if (manualBarcode.trim()) {
      onLookup(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  // Product found view
  if (product) {
    return (
      <div className="space-y-4">
        {/* Success header */}
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle size={18} />
          <span className="text-sm font-semibold">Product Found!</span>
        </div>

        {/* Product card */}
        <div className="bg-white/[0.03] rounded-xl border border-emerald-500/20 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-text-primary">{product.name}</h4>
                {product.brand && (
                  <p className="text-xs text-text-muted">{product.brand}</p>
                )}
                {product.servingSize && (
                  <p className="text-[10px] text-text-muted mt-0.5">Serving: {product.servingSize}</p>
                )}
              </div>
            </div>

            {/* Nutrition grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Calories', value: product.calories, unit: '' },
                { label: 'Protein', value: product.protein, unit: 'g' },
                { label: 'Carbs', value: product.carbs, unit: 'g' },
                { label: 'Fat', value: product.fat, unit: 'g' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="text-center p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-sm font-bold text-text-primary block">
                    {value}{unit}
                  </span>
                  <span className="text-[9px] text-text-muted">{label}</span>
                </div>
              ))}
            </div>

            {/* Extended nutrition */}
            {(product.fiber || product.sugar || product.sodium) && (
              <div className="flex items-center gap-4 text-[10px] text-text-muted p-2 rounded-lg bg-white/[0.02] mb-4">
                {product.fiber !== undefined && <span>Fiber: {product.fiber}g</span>}
                {product.sugar !== undefined && <span>Sugar: {product.sugar}g</span>}
                {product.sodium !== undefined && <span>Sodium: {product.sodium}mg</span>}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onClear}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
              >
                Scan Another
              </button>
              <button
                onClick={() => onAddProduct(product)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
              >
                Add to Log
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Scanning view
  if (isScanning) {
    return (
      <div className="space-y-4">
        {/* Camera placeholder */}
        <div className="relative aspect-[4/3] rounded-xl bg-black overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-32 border-2 border-emerald-400/50 rounded-lg relative">
              {/* Scanning animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 animate-[scan_2s_ease-in-out_infinite]" />
              </div>
              {/* Corner markers */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                <div
                  key={corner}
                  className={`absolute w-4 h-4 border-emerald-400 ${
                    corner.includes('top') ? 'border-t-2' : 'border-b-2'
                  } ${corner.includes('left') ? 'border-l-2 left-0' : 'border-r-2 right-0'} ${
                    corner.includes('top') ? 'top-0' : 'bottom-0'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/60">
            Align barcode within the frame
          </p>
        </div>

        <button
          onClick={onStopScanning}
          className="w-full py-2.5 rounded-xl text-sm font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2"
        >
          <X size={16} />
          Cancel
        </button>

        {/* Demo quick scans */}
        <div className="pt-4 border-t border-white/[0.04]">
          <p className="text-xs text-text-muted mb-2">Demo: Quick scan examples</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_BARCODES.map((demo) => (
              <button
                key={demo.code}
                onClick={() => {
                  onStopScanning();
                  onLookup(demo.code);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[10px] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default view
  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle size={16} />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Scan button */}
      <button
        onClick={onStartScanning}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 hover:border-teal-500/30 transition-all group"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera size={22} className="text-teal-400" />
          </div>
          <span className="text-sm font-semibold text-teal-400">Scan Barcode</span>
          <span className="text-[10px] text-text-muted">Use camera to scan product barcode</span>
        </div>
      </button>

      {/* Manual entry */}
      <div className="space-y-2">
        <p className="text-xs text-text-muted">Or enter barcode manually:</p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Barcode size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
              placeholder="Enter barcode number"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.02] border border-white/[0.06] text-text-primary placeholder-text-muted focus:outline-none focus:border-teal-500/30 transition-all"
            />
          </div>
          <button
            onClick={handleManualLookup}
            disabled={!manualBarcode.trim() || isLookingUp}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500/15 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLookingUp ? <Loader2 size={16} className="animate-spin" /> : 'Look Up'}
          </button>
        </div>
      </div>

      {/* Recent scans */}
      {recentScans.length > 0 && (
        <div className="pt-4 border-t border-white/[0.04]">
          <p className="text-xs text-text-muted mb-2">Recent scans:</p>
          <div className="space-y-2">
            {recentScans.slice(0, 3).map((scan) => (
              <button
                key={scan.barcode}
                onClick={() => onLookup(scan.barcode)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                  <Package size={14} className="text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text-primary truncate block">{scan.name}</span>
                  <span className="text-[10px] text-text-muted">{scan.calories} cal</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
