'use client';

import React from 'react';

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

// Deterministic array of 20 particles to avoid SSR hydration mismatch
const PARTICLES: Particle[] = [
  { id: 1, top: '15%', left: '10%', size: 4, duration: 6, delay: 0, color: 'bg-vip-purple' },
  { id: 2, top: '25%', left: '85%', size: 3, duration: 7, delay: 1.5, color: 'bg-vip-blue' },
  { id: 3, top: '40%', left: '20%', size: 5, duration: 8, delay: 0.5, color: 'bg-vip-purple-light' },
  { id: 4, top: '60%', left: '75%', size: 2, duration: 5, delay: 2, color: 'bg-vip-blue-light' },
  { id: 5, top: '75%', left: '15%', size: 6, duration: 9, delay: 1, color: 'bg-vip-purple' },
  { id: 6, top: '85%', left: '90%', size: 4, duration: 6.5, delay: 3, color: 'bg-vip-blue' },
  { id: 7, top: '10%', left: '45%', size: 3, duration: 7.5, delay: 2.5, color: 'bg-vip-purple-light' },
  { id: 8, top: '35%', left: '60%', size: 5, duration: 8.5, delay: 0.2, color: 'bg-vip-blue' },
  { id: 9, top: '50%', left: '35%', size: 2, duration: 5.5, delay: 3.5, color: 'bg-vip-purple' },
  { id: 10, top: '70%', left: '50%', size: 4, duration: 7, delay: 1.2, color: 'bg-vip-blue-light' },
  { id: 11, top: '20%', left: '30%', size: 3, duration: 6.8, delay: 2.8, color: 'bg-vip-purple' },
  { id: 12, top: '65%', left: '5%', size: 5, duration: 9.2, delay: 0.8, color: 'bg-vip-blue' },
  { id: 13, top: '80%', left: '38%', size: 2, duration: 5.8, delay: 1.9, color: 'bg-vip-purple-light' },
  { id: 14, top: '30%', left: '78%', size: 4, duration: 7.2, delay: 3.1, color: 'bg-vip-blue' },
  { id: 15, top: '90%', left: '65%', size: 6, duration: 8.8, delay: 0.6, color: 'bg-vip-purple' },
  { id: 16, top: '5%', left: '92%', size: 3, duration: 6.2, delay: 2.2, color: 'bg-vip-blue-light' },
  { id: 17, top: '48%', left: '92%', size: 4, duration: 7.9, delay: 1.7, color: 'bg-vip-purple' },
  { id: 18, top: '92%', left: '22%', size: 3, duration: 6.6, delay: 3.3, color: 'bg-vip-blue' },
  { id: 19, top: '58%', left: '42%', size: 5, duration: 8.1, delay: 2.1, color: 'bg-vip-purple-light' },
  { id: 20, top: '18%', left: '68%', size: 2, duration: 5.2, delay: 0.4, color: 'bg-vip-blue' },
];

export const ParticleBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes driftParticle {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.15;
          }
          50% {
            transform: translateY(-35px) translateX(12px);
            opacity: 0.65;
          }
          100% {
            transform: translateY(-70px) translateX(-8px);
            opacity: 0.15;
          }
        }
      `}} />

      {/* Subtle background glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vip-purple/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-vip-blue/15 rounded-full blur-3xl" />

      {/* Floating particles */}
      {PARTICLES.map((particle) => (
        <span
          key={particle.id}
          className={`absolute rounded-full ${particle.color} shadow-sm shadow-current`}
          style={{
            top: particle.top,
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `driftParticle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
