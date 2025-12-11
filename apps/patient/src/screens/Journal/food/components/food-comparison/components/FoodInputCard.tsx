/**
 * FoodInputCard - Card for a single food item input in multi-comparison
 * Supports photo, text, or manual input methods
 */

import { useState, useRef } from 'react';
import { Camera, Wand2, Edit3, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { FoodInputItem, FoodNutritionData } from '../types';
import { HealthGradeBadge } from './HealthGradeBadge';

interface FoodInputCardProps {
  item: FoodInputItem;
  index: number;
  canRemove: boolean;
  disabled?: boolean; // Lock input after analysis has started
  onRemove: () => void;
  onReset: () => void;
  onSetPhoto: (imageData: string) => void;
  onSetText: (text: string) => void;
  onSetManual: (data: FoodNutritionData) => void;
}

export function FoodInputCard({
  item,
  index,
  canRemove,
  disabled = false,
  onRemove,
  onReset,
  onSetPhoto,
  onSetText,
  onSetManual,
}: FoodInputCardProps): React.ReactElement {
  const [showTextInput, setShowTextInput] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [manualData, setManualData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    sodium: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onSetPhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleTextSubmit = () => {
    if (textValue.trim()) {
      onSetText(textValue.trim());
      setShowTextInput(false);
      setTextValue('');
    }
  };

  const handleManualSubmit = () => {
    if (manualData.name && manualData.calories) {
      onSetManual({
        name: manualData.name.trim(),
        calories: parseInt(manualData.calories) || 0,
        protein: parseInt(manualData.protein) || 0,
        carbs: parseInt(manualData.carbs) || 0,
        fat: parseInt(manualData.fat) || 0,
        fiber: parseInt(manualData.fiber) || 0,
        sugar: parseInt(manualData.sugar) || 0,
        sodium: parseInt(manualData.sodium) || 0,
      });
      setShowManualInput(false);
      setManualData({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: '' });
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'ready': return 'border-emerald-500/30 bg-emerald-500/[0.03]';
      case 'analyzing': return 'border-amber-500/30 bg-amber-500/[0.03]';
      case 'pending': return 'border-blue-500/30 bg-blue-500/[0.03]';
      case 'error': return 'border-red-500/30 bg-red-500/[0.03]';
      default: return 'border-white/[0.08] bg-white/[0.02]';
    }
  };

  // Ready state - show analyzed food info
  if (item.status === 'ready' && item.healthProfile) {
    return (
      <div className={`rounded-xl border p-3 ${getStatusColor()}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-muted">#{index + 1}</span>
            <HealthGradeBadge grade={item.healthProfile.healthGrade} size="sm" />
          </div>
          <button
            onClick={onReset}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <X size={14} />
          </button>
        </div>
        <div className="mt-2">
          <p className="font-semibold text-text-primary text-sm truncate">{item.healthProfile.name}</p>
          <div className="flex gap-3 mt-1 text-xs text-text-muted">
            <span>{item.healthProfile.calories} cal</span>
            <span>P: {item.healthProfile.protein}g</span>
            <span>C: {item.healthProfile.carbs}g</span>
            <span>F: {item.healthProfile.fat}g</span>
          </div>
        </div>
        {item.imageData && (
          <div className="mt-2 h-16 rounded-lg overflow-hidden">
            <img src={item.imageData} alt={item.healthProfile.name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  }

  // Analyzing state
  if (item.status === 'analyzing') {
    return (
      <div className={`rounded-xl border p-4 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-text-muted">#{index + 1}</span>
          {canRemove && (
            <button onClick={onRemove} className="p-1 rounded-lg text-text-muted hover:text-red-400 transition-all">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="text-center">
            <Loader2 size={24} className="text-amber-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-muted">Analyzing...</p>
          </div>
        </div>
        {item.imageData && (
          <div className="mt-2 h-16 rounded-lg overflow-hidden opacity-50">
            <img src={item.imageData} alt="Analyzing" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  }

  // Pending state - waiting for analysis
  if (item.status === 'pending') {
    return (
      <div className={`rounded-xl border p-4 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-text-muted">#{index + 1}</span>
          <button onClick={onReset} className="p-1 rounded-lg text-text-muted hover:text-text-primary transition-all">
            <X size={14} />
          </button>
        </div>
        <div className="flex items-center justify-center py-2">
          <div className="text-center">
            <CheckCircle size={20} className="text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-text-muted">Ready to analyze</p>
            {item.inputMethod === 'text' && item.textDescription && (
              <p className="text-xs text-text-secondary mt-1 truncate max-w-[150px]">{item.textDescription}</p>
            )}
          </div>
        </div>
        {item.imageData && (
          <div className="mt-2 h-16 rounded-lg overflow-hidden">
            <img src={item.imageData} alt="Ready" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (item.status === 'error') {
    return (
      <div className={`rounded-xl border p-4 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-text-muted">#{index + 1}</span>
          <button onClick={onReset} className="p-1 rounded-lg text-text-muted hover:text-text-primary transition-all">
            <X size={14} />
          </button>
        </div>
        <div className="text-center py-2">
          <AlertCircle size={20} className="text-red-400 mx-auto mb-1" />
          <p className="text-xs text-red-400">{item.error || 'Analysis failed'}</p>
        </div>
        <button
          onClick={onReset}
          className="w-full mt-2 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state - show input options or locked state
  return (
    <div className={`rounded-xl border p-4 ${getStatusColor()} ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-muted">#{index + 1}</span>
        {canRemove && !disabled && (
          <button onClick={onRemove} className="p-1 rounded-lg text-text-muted hover:text-red-400 transition-all">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Disabled/Locked state */}
      {disabled && (
        <div className="flex items-center justify-center py-4">
          <p className="text-xs text-text-muted text-center">Not used</p>
        </div>
      )}

      {/* Text input mode */}
      {!disabled && showTextInput && (
        <div className="space-y-2">
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="e.g., grilled chicken with rice"
            className="w-full px-2.5 py-2 rounded-lg text-xs bg-white/[0.03] border border-white/[0.08] text-text-primary placeholder-text-muted focus:outline-none focus:border-violet-500/30 resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowTextInput(false); setTextValue(''); }}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleTextSubmit}
              disabled={!textValue.trim()}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-violet-500/15 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 disabled:opacity-40 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Manual input mode */}
      {!disabled && showManualInput && (
        <div className="space-y-2">
          <input
            type="text"
            value={manualData.name}
            onChange={(e) => setManualData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Food name"
            className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.03] border border-white/[0.08] text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/30"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: 'calories', label: 'Cal', unit: '' },
              { key: 'protein', label: 'Protein', unit: 'g' },
              { key: 'carbs', label: 'Carbs', unit: 'g' },
              { key: 'fat', label: 'Fat', unit: 'g' },
            ].map(({ key, label, unit }) => (
              <div key={key} className="relative">
                <input
                  type="number"
                  value={manualData[key as keyof typeof manualData]}
                  onChange={(e) => setManualData(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={label}
                  className="w-full px-2 py-1.5 pr-6 rounded-lg text-xs bg-white/[0.03] border border-white/[0.08] text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/30"
                />
                {unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">{unit}</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowManualInput(false); setManualData({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: '' }); }}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={!manualData.name || !manualData.calories}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Default: show input method buttons */}
      {!disabled && !showTextInput && !showManualInput && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 transition-all flex items-center justify-center gap-1.5"
            >
              <Camera size={14} />
              Photo
            </button>
            <button
              onClick={() => setShowTextInput(true)}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/15 transition-all flex items-center justify-center gap-1.5"
            >
              <Wand2 size={14} />
              Describe
            </button>
          </div>
          <button
            onClick={() => setShowManualInput(true)}
            className="w-full py-2 rounded-lg text-xs font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all flex items-center justify-center gap-1.5"
          >
            <Edit3 size={12} />
            Manual Entry
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
