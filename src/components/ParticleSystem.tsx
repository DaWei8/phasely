"use client"

import { useEffect, useState } from "react";
interface ParticleSystemProps {
  isActive: boolean;
  color: string;
}
// Particle system for celebration effects
export const ParticleSystem = ({ isActive, color }: ParticleSystemProps) => {
   const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    decay: number;
    size: number;
  }>>([]);

  useEffect(() => {
    if (!isActive) return;

    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      size: Math.random() * 4 + 2,
    }));

    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - p.decay,
        })).filter(p => p.life > 0)
      );
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setParticles([]);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute w-1 h-1 ${color} rounded-full animate-pulse`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.life,
            transform: `scale(${particle.size / 4})`,
          }}
        />
      ))}
    </div>
  );
};
