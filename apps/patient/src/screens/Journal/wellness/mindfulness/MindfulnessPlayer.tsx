/**
 * Mindfulness Player - Full screen meditation player
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Play, Pause, Volume2, VolumeX,
  SkipBack, SkipForward, CloudRain, Waves,
  TreePine, Flame, Star, Sparkles,
} from 'lucide-react';
import { MindfulnessModule, AmbientSound, MODULE_DEFAULT_SOUNDS } from './types';
import { ambientSound } from './AmbientSoundPlayer';
import { BreathingAnimation } from './BreathingAnimation';
import { getCategoryColor, getCategoryIcon } from './categoryUtils';

interface MindfulnessPlayerProps {
  module: MindfulnessModule;
  onClose: () => void;
}

export function MindfulnessPlayer({ module, onClose }: MindfulnessPlayerProps): React.ReactElement {
  // Get default sound for this module
  const defaultSound = MODULE_DEFAULT_SOUNDS[module.id] || 'none';

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSound, setSelectedSound] = useState<AmbientSound>(defaultSound);
  const [soundVolume, setSoundVolume] = useState(0.4);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lock body scroll when modal is open and stop sound on unmount
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
      // Always stop ambient sound when modal closes
      ambientSound.stop();
    };
  }, []);

  const totalSeconds = module.duration * 60;
  const categoryColors = getCategoryColor(module.category);
  const colorKey = module.category === 'Vitality' ? 'cyan' : module.category === 'Sleep' ? 'purple' : module.category === 'Stress' ? 'emerald' : 'amber';

  // Rich sound options using real audio files
  const soundOptions: { id: AmbientSound | 'default'; label: string; icon: typeof CloudRain }[] = [
    { id: 'default', label: 'Default', icon: Sparkles },
    { id: 'none', label: 'Silent', icon: VolumeX },
    { id: 'rain', label: 'Rain', icon: CloudRain },
    { id: 'ocean', label: 'Ocean', icon: Waves },
    { id: 'forest', label: 'Forest', icon: TreePine },
    { id: 'fireplace', label: 'Fire', icon: Flame },
    { id: 'singing-bowl', label: 'Bowl', icon: Star },
  ];

  useEffect(() => {
    // Always stop current sound first when any dependency changes
    ambientSound.stop();

    if (isPlaying) {
      // Only play if not 'none'
      if (selectedSound !== 'none') {
        ambientSound.play(selectedSound, soundVolume);
      }
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          setProgress((next / totalSeconds) * 100);
          if (next >= totalSeconds) {
            setIsPlaying(false);
            ambientSound.stop();
            return totalSeconds;
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ambientSound.stop();
    };
  }, [isPlaying, selectedSound, soundVolume, totalSeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const IconComponent = getCategoryIcon(module.category);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0a0a0f] overflow-hidden" style={{ width: '100vw', height: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={onClose} className="p-2.5 -ml-2 rounded-xl text-white/70 hover:bg-white/5">
          <X size={24} />
        </button>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={soundVolume * 100}
            onChange={(e) => {
              const vol = parseInt(e.target.value) / 100;
              setSoundVolume(vol);
              ambientSound.setVolume(vol);
            }}
            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
          />
          <Volume2 size={18} className="text-white/50" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className={`mb-3 p-3 rounded-2xl ${categoryColors.bg} ${categoryColors.border} border`}>
          <IconComponent size={24} className={categoryColors.text} />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{module.title}</h2>
        <p className="text-sm text-white/60 mb-6">{module.description}</p>

        {/* Sound Selector */}
        <div className="grid grid-cols-7 gap-1.5 mb-8 w-full max-w-md">
          {soundOptions.map(({ id, label, icon: SoundIcon }) => {
            const isSelected = id === 'default'
              ? selectedSound === defaultSound
              : selectedSound === id;
            return (
              <button
                key={id}
                onClick={() => {
                  const soundToPlay = id === 'default' ? defaultSound : id;
                  setSelectedSound(soundToPlay);
                  if (isPlaying) {
                    ambientSound.stop();
                    if (soundToPlay !== 'none') ambientSound.play(soundToPlay, soundVolume);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
              >
                <SoundIcon size={16} className={isSelected ? 'text-white' : 'text-white/50'} />
                <span className={`text-[10px] ${isSelected ? 'text-white' : 'text-white/50'}`}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Breathing */}
        <BreathingAnimation isPlaying={isPlaying} color={colorKey} />

        {/* Time */}
        <div className="mt-8 text-center">
          <span className="text-3xl font-light text-white tabular-nums">{formatTime(currentTime)}</span>
          <span className="text-lg text-white/40"> / {formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 pb-10">
        <div className="mb-6">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${categoryColors.hex}80, ${categoryColors.hex})`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 15))}
            className="flex flex-col items-center gap-0.5 p-2 text-white/50 hover:text-white transition-colors"
          >
            <SkipBack size={20} />
            <span className="text-[9px] font-medium">15s</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${categoryColors.hex}30, ${categoryColors.hex}15)`,
              border: `2px solid ${categoryColors.hex}50`,
            }}
          >
            {isPlaying ? (
              <Pause size={28} className={categoryColors.text} />
            ) : (
              <Play size={28} className={`${categoryColors.text} ml-1`} />
            )}
          </button>

          <button
            onClick={() => setCurrentTime(Math.min(totalSeconds, currentTime + 15))}
            className="flex flex-col items-center gap-0.5 p-2 text-white/50 hover:text-white transition-colors"
          >
            <SkipForward size={20} />
            <span className="text-[9px] font-medium">15s</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
