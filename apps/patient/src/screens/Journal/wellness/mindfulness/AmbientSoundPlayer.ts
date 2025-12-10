/**
 * Ambient Sound Player (Real Audio Files)
 * Singleton class for managing ambient sound playback
 */

import { AmbientSound, AMBIENT_AUDIO_FILES } from './types';

class AmbientSoundPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentSound: AmbientSound = 'none';

  play(type: AmbientSound, volume = 0.3): void {
    if (type === 'none') {
      this.stop();
      return;
    }

    // If same sound, just adjust volume
    if (this.audio && this.currentSound === type) {
      this.audio.volume = volume;
      if (this.audio.paused) {
        this.audio.play().catch(() => {});
      }
      return;
    }

    this.stop();

    const audioFile = AMBIENT_AUDIO_FILES[type];
    if (!audioFile) return;

    this.audio = new Audio(audioFile);
    this.audio.loop = true;
    this.audio.volume = volume;
    this.currentSound = type;

    // Fade in
    this.audio.volume = 0;
    this.audio.play().catch(() => {});

    // Gradual fade in over 1 second
    let fadeVolume = 0;
    const fadeInterval = setInterval(() => {
      fadeVolume += 0.05;
      if (this.audio && fadeVolume <= volume) {
        this.audio.volume = fadeVolume;
      } else {
        clearInterval(fadeInterval);
      }
    }, 50);
  }

  stop(): void {
    if (this.audio) {
      // Immediately stop - no fade to prevent race conditions
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.currentSound = 'none';
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  getCurrentSound(): AmbientSound {
    return this.currentSound;
  }
}

// Singleton instance
export const ambientSound = new AmbientSoundPlayer();
