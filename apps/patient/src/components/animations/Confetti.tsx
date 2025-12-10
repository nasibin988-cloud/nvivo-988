/**
 * Confetti - Celebration animation for goal completion
 * Renders animated particles that fall and fade out
 */

import { useEffect, useState, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

interface ConfettiProps {
  /** Whether to show confetti animation */
  active: boolean;
  /** Duration in ms before auto-cleanup (default: 3000) */
  duration?: number;
  /** Number of particles to spawn (default: 50) */
  particleCount?: number;
  /** Colors for particles */
  colors?: string[];
  /** Callback when animation completes */
  onComplete?: () => void;
}

const DEFAULT_COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#06b6d4', // cyan
];

export function Confetti({
  active,
  duration = 3000,
  particleCount = 50,
  colors = DEFAULT_COLORS,
  onComplete,
}: ConfettiProps): React.ReactElement | null {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: -10 - Math.random() * 20, // start above viewport
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        velocity: {
          x: (Math.random() - 0.5) * 3,
          y: 2 + Math.random() * 4,
        },
      });
    }
    return newParticles;
  }, [particleCount, colors]);

  useEffect(() => {
    if (active && !isAnimating) {
      setIsAnimating(true);
      setParticles(createParticles());

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, isAnimating, createParticles, duration, onComplete]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating || particles.length === 0) return;

    let frameId: number;
    const animate = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.velocity.x * 0.3,
          y: p.y + p.velocity.y * 0.5,
          rotation: p.rotation + p.velocity.x * 2,
          velocity: {
            x: p.velocity.x * 0.99,
            y: p.velocity.y + 0.1, // gravity
          },
        }))
      );
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isAnimating, particles.length]);

  if (!isAnimating || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute transition-opacity"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.y < 120 ? 1 : 0,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
