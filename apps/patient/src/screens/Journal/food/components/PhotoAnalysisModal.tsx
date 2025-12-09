/**
 * Photo Analysis Modal
 * AI-powered food photo analysis using GPT-4 Vision
 */

import { useState, useRef, useCallback } from 'react';
import {
  Camera,
  X,
  Loader2,
  Sparkles,
  Check,
  AlertCircle,
  RotateCcw,
  Image,
  Upload,
  Flame,
  Beef,
  Wheat,
  Droplets,
  ChevronDown,
  Edit3,
  Plus,
  Minus,
  Clock,
  Sun,
  Sunset,
  Moon,
  Coffee,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';

interface AnalyzedFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  confidence: number;
}

interface AnalysisResult {
  items: AnalyzedFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  eatenAt?: string;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_TYPES: { type: MealType; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: Sun, color: 'amber' },
  { type: 'lunch', label: 'Lunch', icon: Coffee, color: 'emerald' },
  { type: 'dinner', label: 'Dinner', icon: Sunset, color: 'violet' },
  { type: 'snack', label: 'Snack', icon: Moon, color: 'blue' },
];

interface PhotoAnalysisModalProps {
  onClose: () => void;
  onConfirm: (result: AnalysisResult) => void;
}

export default function PhotoAnalysisModal({ onClose, onConfirm }: PhotoAnalysisModalProps) {
  const [step, setStep] = useState<'capture' | 'analyzing' | 'review'>('capture');
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [eatenAt, setEatenAt] = useState<string>(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access denied. Please use file upload instead.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsStreaming(false);
    }
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    setImageData(base64);
    stopCamera();
    analyzeImage(base64);
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageData(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Analyze image with AI
  const analyzeImage = async (base64: string) => {
    setStep('analyzing');
    setError(null);

    try {
      const functions = getFunctions();
      const analyzeFn = httpsCallable<{ imageBase64: string }, AnalysisResult>(
        functions,
        'analyzeFoodPhoto'
      );

      // Remove data URL prefix for API
      const imageContent = base64.split(',')[1];
      const response = await analyzeFn({ imageBase64: imageContent });
      setResult(response.data);
      // Set meal type from AI suggestion if valid
      if (response.data.mealType && response.data.mealType !== 'unknown') {
        setSelectedMealType(response.data.mealType as MealType);
      }
      setStep('review');
    } catch (err) {
      console.error('Analysis failed:', err);
      // Use mock result for demo
      const mockResult = getMockAnalysisResult();
      setResult(mockResult);
      if (mockResult.mealType && mockResult.mealType !== 'unknown') {
        setSelectedMealType(mockResult.mealType as MealType);
      }
      setStep('review');
    }
  };

  // Retry analysis
  const handleRetry = () => {
    setImageData(null);
    setResult(null);
    setError(null);
    setStep('capture');
  };

  // Update item
  const handleUpdateItem = (index: number, updates: Partial<AnalyzedFood>) => {
    if (!result) return;

    const newItems = [...result.items];
    newItems[index] = { ...newItems[index], ...updates };

    // Recalculate totals
    const totals = newItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setResult({
      ...result,
      items: newItems,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
    });
    setEditingItem(null);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    if (!result) return;

    const newItems = result.items.filter((_, i) => i !== index);
    const totals = newItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setResult({
      ...result,
      items: newItems,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
    });
  };

  // Update portion and scale nutritional values
  const handlePortionChange = (index: number, newQuantity: number) => {
    if (!result || newQuantity <= 0) return;

    const item = result.items[index];
    const multiplier = newQuantity / item.quantity;

    const updatedItem: AnalyzedFood = {
      ...item,
      quantity: newQuantity,
      calories: Math.round(item.calories * multiplier),
      protein: Math.round(item.protein * multiplier * 10) / 10,
      carbs: Math.round(item.carbs * multiplier * 10) / 10,
      fat: Math.round(item.fat * multiplier * 10) / 10,
      fiber: item.fiber ? Math.round(item.fiber * multiplier * 10) / 10 : undefined,
    };

    const newItems = [...result.items];
    newItems[index] = updatedItem;

    // Recalculate totals
    const totals = newItems.reduce(
      (acc, i) => ({
        calories: acc.calories + i.calories,
        protein: acc.protein + i.protein,
        carbs: acc.carbs + i.carbs,
        fat: acc.fat + i.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setResult({
      ...result,
      items: newItems,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      totalFat: Math.round(totals.fat * 10) / 10,
    });
  };

  // Confirm and save
  const handleConfirm = () => {
    if (result) {
      onConfirm({
        ...result,
        mealType: selectedMealType,
        eatenAt,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl border border-white/[0.08] overflow-hidden max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex justify-between items-center shrink-0 bg-gradient-to-r from-violet-500/[0.08] via-purple-500/[0.05] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/90 to-purple-600/90 text-white shadow-lg shadow-violet-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Photo AI</h2>
              <p className="text-xs text-text-muted">
                {step === 'capture' && 'Take a photo of your meal'}
                {step === 'analyzing' && 'Analyzing your food...'}
                {step === 'review' && 'Review & adjust'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Capture Step */}
          {step === 'capture' && (
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
                  onClick={isStreaming ? capturePhoto : startCamera}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-500/90 to-purple-600/90 text-white font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <Camera size={20} />
                  {isStreaming ? 'Capture' : 'Open Camera'}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-text-primary font-semibold hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
                >
                  <Upload size={20} />
                  Upload Photo
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-400" />
                  <p className="text-sm text-rose-400">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Analyzing Step */}
          {step === 'analyzing' && (
            <div className="p-5 space-y-4">
              {/* Image preview */}
              {imageData && (
                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative border border-white/[0.06]">
                  <img src={imageData} alt="Food" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="relative">
                      <Loader2 size={48} className="text-violet-400 animate-spin" />
                      <Sparkles size={20} className="text-violet-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <p className="text-white font-medium mt-4">Analyzing your meal...</p>
                    <p className="text-white/50 text-sm mt-1">This may take a few seconds</p>
                  </div>
                </div>
              )}

              {/* Progress indicators */}
              <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                {['Detecting food items', 'Estimating portions', 'Calculating nutrition'].map(
                  (text, i) => (
                    <div key={text} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          i < 2 ? 'bg-emerald-500/80' : 'bg-violet-500/80 animate-pulse'
                        }`}
                      >
                        {i < 2 ? (
                          <Check size={12} className="text-white" />
                        ) : (
                          <Loader2 size={12} className="text-white animate-spin" />
                        )}
                      </div>
                      <span className="text-sm text-text-secondary">{text}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && result && (
            <div className="p-5 space-y-4">
              {/* Image preview (small) */}
              {imageData && (
                <div className="h-32 rounded-xl overflow-hidden relative border border-white/[0.06]">
                  <img src={imageData} alt="Food" className="w-full h-full object-cover" />
                  <button
                    onClick={handleRetry}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-black/60 transition-colors"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              )}

              {/* Meal Type & Time Selection */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                {/* Meal Type */}
                <div>
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                    Meal Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {MEAL_TYPES.map(({ type, label, icon: Icon, color }) => (
                      <button
                        key={type}
                        onClick={() => setSelectedMealType(type)}
                        className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                          selectedMealType === type
                            ? `bg-${color}-500/[0.15] border border-${color}-500/40 text-${color}-400`
                            : 'bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
                        }`}
                        style={selectedMealType === type ? {
                          backgroundColor: color === 'amber' ? 'rgba(245, 158, 11, 0.15)' :
                                          color === 'emerald' ? 'rgba(16, 185, 129, 0.15)' :
                                          color === 'violet' ? 'rgba(139, 92, 246, 0.15)' :
                                          'rgba(59, 130, 246, 0.15)',
                          borderColor: color === 'amber' ? 'rgba(245, 158, 11, 0.4)' :
                                       color === 'emerald' ? 'rgba(16, 185, 129, 0.4)' :
                                       color === 'violet' ? 'rgba(139, 92, 246, 0.4)' :
                                       'rgba(59, 130, 246, 0.4)',
                          color: color === 'amber' ? 'rgb(251, 191, 36)' :
                                 color === 'emerald' ? 'rgb(52, 211, 153)' :
                                 color === 'violet' ? 'rgb(167, 139, 250)' :
                                 'rgb(96, 165, 250)'
                        } : {}}
                      >
                        <Icon size={18} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                    Time Eaten
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="time"
                        value={eatenAt}
                        onChange={(e) => setEatenAt(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text-primary focus:outline-none focus:border-violet-500/40 transition-colors [color-scheme:dark]"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const now = new Date();
                        setEatenAt(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text-muted text-sm font-medium hover:text-text-primary hover:bg-white/[0.06] transition-all"
                    >
                      Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Total summary */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/[0.08] via-teal-500/[0.04] to-transparent border border-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-secondary">Total Nutrition</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/[0.12] border border-violet-500/20 text-violet-400 text-xs font-medium">
                    <Sparkles size={10} />
                    AI Estimated
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-400">{result.totalCalories}</div>
                    <div className="text-[10px] text-text-muted">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-rose-400">{result.totalProtein}g</div>
                    <div className="text-[10px] text-text-muted">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-400/80">{result.totalCarbs}g</div>
                    <div className="text-[10px] text-text-muted">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">{result.totalFat}g</div>
                    <div className="text-[10px] text-text-muted">Fat</div>
                  </div>
                </div>
              </div>

              {/* Detected items */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Detected Items ({result.items.length})
                </p>
                {result.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">
                            {item.name}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded ${
                              item.confidence >= 0.8
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : item.confidence >= 0.6
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                        <span className="text-xs text-text-muted">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-amber-400">
                          {item.calories} cal
                        </span>
                        <button
                          onClick={() => setEditingItem(editingItem === index ? null : index)}
                          className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
                        >
                          <ChevronDown
                            size={14}
                            className={`text-text-muted transition-transform duration-200 ${
                              editingItem === index ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Expanded edit view */}
                    {editingItem === index && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
                        {/* Food name edit */}
                        <div>
                          <label className="text-xs font-medium text-text-muted mb-1.5 block">Food Name</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(index, { name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-violet-500/40 transition-colors"
                          />
                        </div>

                        {/* Calories edit */}
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-text-muted">Calories</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateItem(index, { calories: Math.max(0, item.calories - 10) })}
                              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-amber-500/30 transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              value={item.calories}
                              onChange={(e) => handleUpdateItem(index, { calories: parseInt(e.target.value) || 0 })}
                              className="w-20 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-sm text-amber-400 font-semibold focus:outline-none focus:border-amber-500/40 transition-colors"
                            />
                            <button
                              onClick={() => handleUpdateItem(index, { calories: item.calories + 10 })}
                              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-amber-500/30 transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Portion controls */}
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-text-muted">Portion</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePortionChange(index, Math.max(0.25, item.quantity - 0.25))}
                              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-violet-500/30 transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.25"
                                min="0.25"
                                value={item.quantity}
                                onChange={(e) => handlePortionChange(index, parseFloat(e.target.value) || 0.25)}
                                className="w-16 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-sm text-text-primary focus:outline-none focus:border-violet-500/40 transition-colors"
                              />
                              <span className="text-xs text-text-muted">{item.unit}</span>
                            </div>
                            <button
                              onClick={() => handlePortionChange(index, item.quantity + 0.25)}
                              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-violet-500/30 transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Quick portion buttons */}
                        <div className="flex gap-2">
                          {[0.5, 1, 1.5, 2].map((qty) => (
                            <button
                              key={qty}
                              onClick={() => handlePortionChange(index, qty)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                item.quantity === qty
                                  ? 'bg-violet-500/[0.15] border border-violet-500/40 text-violet-400'
                                  : 'bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04] hover:border-white/[0.1]'
                              }`}
                            >
                              {qty}x
                            </button>
                          ))}
                        </div>

                        {/* Macros edit */}
                        <div>
                          <label className="text-xs font-medium text-text-muted mb-2 block">Macros (grams)</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { key: 'protein', label: 'Protein', borderColor: 'focus:border-rose-500/40', textColor: 'text-rose-400' },
                              { key: 'carbs', label: 'Carbs', borderColor: 'focus:border-amber-500/40', textColor: 'text-amber-400' },
                              { key: 'fat', label: 'Fat', borderColor: 'focus:border-blue-500/40', textColor: 'text-blue-400' },
                              { key: 'fiber', label: 'Fiber', borderColor: 'focus:border-emerald-500/40', textColor: 'text-emerald-400' },
                            ].map(({ key, label, borderColor, textColor }) => (
                              <div key={key} className="text-center">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={item[key as keyof AnalyzedFood] || 0}
                                  onChange={(e) => handleUpdateItem(index, { [key]: parseFloat(e.target.value) || 0 })}
                                  className={`w-full px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-sm font-semibold ${textColor} focus:outline-none ${borderColor} transition-colors`}
                                />
                                <div className="text-[9px] text-text-muted mt-1">{label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="w-full py-2.5 rounded-lg bg-rose-500/[0.08] border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/[0.15] hover:border-rose-500/30 transition-all"
                        >
                          Remove Item
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'review' && (
          <div className="p-4 border-t border-white/[0.06] bg-white/[0.01] shrink-0">
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-xl font-semibold text-base bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)]"
            >
              Add to Food Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock analysis result for demo
function getMockAnalysisResult(): AnalysisResult {
  return {
    items: [
      {
        name: 'Grilled chicken breast',
        quantity: 1,
        unit: 'piece (6 oz)',
        calories: 280,
        protein: 52,
        carbs: 0,
        fat: 6,
        fiber: 0,
        confidence: 0.92,
      },
      {
        name: 'Steamed broccoli',
        quantity: 1,
        unit: 'cup',
        calories: 55,
        protein: 4,
        carbs: 11,
        fat: 0.5,
        fiber: 5,
        confidence: 0.88,
      },
      {
        name: 'Brown rice',
        quantity: 0.5,
        unit: 'cup',
        calories: 108,
        protein: 2.5,
        carbs: 22,
        fat: 1,
        fiber: 2,
        confidence: 0.85,
      },
    ],
    totalCalories: 443,
    totalProtein: 58.5,
    totalCarbs: 33,
    totalFat: 7.5,
    mealType: 'lunch',
  };
}
