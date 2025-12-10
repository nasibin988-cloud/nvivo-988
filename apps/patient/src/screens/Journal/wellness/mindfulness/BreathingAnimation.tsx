/**
 * Breathing Animation with Particle Swarm
 * Visual breathing guide for meditation sessions
 */

import { useState, useEffect } from 'react';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'relax';

const PARTICLE_COUNT = 60;

// Pre-generate particles with fixed seeds
const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  id: i,
  angle: (i * 137.5 * Math.PI) / 180, // Phyllotaxis golden angle
  size: 2 + (i % 4),
  delay: (i % 10) * 0.05,
}));

interface ParticleSwarmProps {
  phase: BreathPhase;
  color: string;
  isPlaying: boolean;
}

function ParticleSwarm({ phase, color, isPlaying }: ParticleSwarmProps): React.ReactElement {
  const getParticleStyle = (p: typeof particles[0]): React.CSSProperties => {
    let spread = 60;
    let opacity = 0.6;
    let scale = 1;

    if (isPlaying) {
      switch (phase) {
        case 'inhale':
          spread = 140 + (p.id % 7) * 5;
          opacity = 0.4;
          scale = 1.2;
          break;
        case 'hold':
          spread = 150 + (p.id % 5) * 4;
          opacity = 0.3;
          scale = 1.3;
          break;
        case 'exhale':
          spread = 20 + (p.id % 5) * 3;
          opacity = 0.9;
          scale = 0.8;
          break;
        case 'relax':
          spread = 60 + (p.id % 7) * 4;
          opacity = 0.6;
          scale = 1;
          break;
      }
    }

    const x = Math.cos(p.angle) * spread;
    const y = Math.sin(p.angle) * spread;

    return {
      position: 'absolute',
      width: p.size,
      height: p.size,
      backgroundColor: color,
      boxShadow: `0 0 10px ${color}`,
      borderRadius: '50%',
      filter: 'blur(1px)',
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      transition: `all 4s ease-out`,
      transitionDelay: `${p.delay}s`,
    };
  };

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Particles */}
      {particles.map((p) => (
        <div key={p.id} style={getParticleStyle(p)} />
      ))}

      {/* Inner Glow Core */}
      <div
        className="absolute rounded-full blur-2xl transition-all duration-[4000ms] ease-in-out"
        style={{
          width: phase === 'exhale' ? '80px' : '160px',
          height: phase === 'exhale' ? '80px' : '160px',
          backgroundColor: color,
          opacity: phase === 'exhale' ? 0.5 : 0.2,
        }}
      />
    </div>
  );
}

interface BreathingAnimationProps {
  isPlaying: boolean;
  color: string;
}

export function BreathingAnimation({ isPlaying, color }: BreathingAnimationProps): React.ReactElement {
  const [phase, setPhase] = useState<BreathPhase>('relax');
  const [message, setMessage] = useState('PREPARE FOR RELAXATION...');

  useEffect(() => {
    if (!isPlaying) {
      setPhase('relax');
      setMessage('PREPARE FOR RELAXATION...');
      return;
    }

    // Box breathing pattern: 4-4-4-4
    const phases: { phase: BreathPhase; duration: number; message: string }[] = [
      { phase: 'inhale', duration: 4000, message: 'BREATHE IN...' },
      { phase: 'hold', duration: 4000, message: 'HOLD...' },
      { phase: 'exhale', duration: 4000, message: 'EXHALE...' },
      { phase: 'relax', duration: 4000, message: 'RELAX...' },
    ];

    let phaseIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runPhase = () => {
      const current = phases[phaseIndex];
      setPhase(current.phase);
      setMessage(current.message);
      phaseIndex = (phaseIndex + 1) % phases.length;
      timeoutId = setTimeout(runPhase, current.duration);
    };

    runPhase();

    return () => clearTimeout(timeoutId);
  }, [isPlaying]);

  const colors: Record<string, { primary: string; glow: string }> = {
    cyan: { primary: '#22D3EE', glow: 'rgba(34, 211, 238, 0.4)' },
    purple: { primary: '#A78BFA', glow: 'rgba(167, 139, 250, 0.4)' },
    emerald: { primary: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    amber: { primary: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)' },
  };

  const c = colors[color] || colors.cyan;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <ParticleSwarm phase={phase} color={c.primary} isPlaying={isPlaying} />

      {/* Instruction */}
      {isPlaying && (
        <div
          className="absolute bottom-8 text-center text-2xl font-light tracking-widest uppercase transition-opacity duration-500"
          style={{
            color: c.primary,
            textShadow: `0 0 15px ${c.glow}`,
            opacity: 1,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
