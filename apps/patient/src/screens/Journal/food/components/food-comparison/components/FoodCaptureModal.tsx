/**
 * FoodCaptureModal - Camera/gallery capture for food photo analysis
 * Used in food comparison to quickly add foods via photo
 * Uses shared useFoodAI hook for consistency across the app
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, Image, Loader2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useFoodAI, type AnalyzedFoodItem } from '../../../../../../hooks/useFoodAI';

interface FoodCaptureModalProps {
  onClose: () => void;
  onFoodAnalyzed: (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  }) => void;
}

type CaptureStep = 'capture' | 'preview' | 'analyzing' | 'result' | 'error';

export function FoodCaptureModal({
  onClose,
  onFoodAnalyzed,
}: FoodCaptureModalProps): React.ReactElement {
  const [step, setStep] = useState<CaptureStep>('capture');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use shared food AI hook
  const { analyzePhoto, result: analysisResult, error, reset } = useFoodAI();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError('Camera access denied. Please use file upload instead.');
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

  // Capture photo from video
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
    setStep('preview');
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageData(base64);
      stopCamera();
      setStep('preview');
    };
    reader.readAsDataURL(file);
  };

  // Analyze the image using shared hook
  const handleAnalyze = useCallback(async () => {
    if (!imageData) return;

    setStep('analyzing');

    const result = await analyzePhoto(imageData);
    if (result) {
      setSelectedItemIndex(0);
      setStep('result');
    }
  }, [imageData, analyzePhoto]);

  // Handle selecting a food item to use
  const handleSelectFood = () => {
    if (!analysisResult || !analysisResult.items[selectedItemIndex]) return;

    const item = analysisResult.items[selectedItemIndex];
    onFoodAnalyzed({
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber,
      sugar: item.sugar,
      sodium: item.sodium,
    });
  };

  // Retry capture
  const handleRetry = () => {
    setImageData(null);
    reset();
    setStep('capture');
    startCamera();
  };

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl border border-white/[0.08] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/90 to-teal-500/90 text-white">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Scan Food</h2>
              <p className="text-xs text-text-muted">
                {step === 'capture' && 'Take a photo or upload'}
                {step === 'preview' && 'Preview your photo'}
                {step === 'analyzing' && 'Analyzing...'}
                {step === 'result' && 'Select detected food'}
                {step === 'error' && 'Something went wrong'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Capture View */}
          {step === 'capture' && (
            <div className="h-full flex flex-col">
              {/* Camera view */}
              <div className="relative aspect-[4/3] bg-black overflow-hidden">
                {cameraError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                    <div>
                      <AlertCircle className="mx-auto mb-2 text-amber-400" size={32} />
                      <p className="text-sm text-text-muted">{cameraError}</p>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Corner guides */}
                {isStreaming && (
                  <>
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400/70 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400/70 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400/70 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400/70 rounded-br-lg" />
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="p-4 flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 rounded-xl font-medium text-sm bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
                >
                  <Image size={18} />
                  Upload
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={!isStreaming}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Camera size={18} />
                  Capture
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Preview View */}
          {step === 'preview' && imageData && (
            <div className="h-full flex flex-col">
              <div className="relative aspect-[4/3] bg-black overflow-hidden">
                <img
                  src={imageData}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 rounded-xl font-medium text-sm bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Retake
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Analyze
                </button>
              </div>
            </div>
          )}

          {/* Analyzing View */}
          {step === 'analyzing' && (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
                <p className="text-sm text-text-muted">Analyzing your food...</p>
                <p className="text-xs text-text-muted/60 mt-1">
                  AI is identifying nutrients
                </p>
              </div>
            </div>
          )}

          {/* Result View */}
          {step === 'result' && analysisResult && (
            <div className="p-4 space-y-4">
              {/* Thumbnail */}
              {imageData && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/20">
                  <img
                    src={imageData}
                    alt="Analyzed food"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div className="text-center">
                <p className="text-sm text-text-muted">
                  {analysisResult.description || 'Food analyzed successfully'}
                </p>
                {error && (
                  <p className="text-xs text-amber-400 mt-1">{error}</p>
                )}
              </div>

              {/* Detected items */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Detected Items
                </p>
                {analysisResult.items.map((item: AnalyzedFoodItem, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedItemIndex(index)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedItemIndex === index
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary">{item.name}</span>
                      <span className="text-sm text-emerald-400">{item.calories} cal</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-text-muted">
                      <span>P: {item.protein}g</span>
                      <span>C: {item.carbs}g</span>
                      <span>F: {item.fat}g</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 rounded-xl font-medium text-sm bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all"
                >
                  Retake
                </button>
                <button
                  onClick={handleSelectFood}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Use This Food
                </button>
              </div>
            </div>
          )}

          {/* Error View */}
          {step === 'error' && (
            <div className="p-4">
              <div className="text-center py-8">
                <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
                <p className="text-sm text-text-primary mb-2">Analysis Failed</p>
                <p className="text-xs text-text-muted">{error || 'Please try again'}</p>
              </div>
              <button
                onClick={handleRetry}
                className="w-full py-3 rounded-xl font-medium text-sm bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
