'use client';

import React from 'react';

// 18 deterministic floating diamond sparkles & glowing orbs
const BACKGROUND_ORBS = [
  { id: 1, top: '8%', left: '12%', size: 6, duration: 8, delay: 0, color: '#f59e0b' },
  { id: 2, top: '22%', left: '88%', size: 8, duration: 9, delay: 1.2, color: '#a855f7' },
  { id: 3, top: '35%', left: '6%', size: 5, duration: 11, delay: 0.5, color: '#3b82f6' },
  { id: 4, top: '48%', left: '82%', size: 7, duration: 7, delay: 2.1, color: '#f59e0b' },
  { id: 5, top: '65%', left: '18%', size: 6, duration: 10, delay: 1.8, color: '#a855f7' },
  { id: 6, top: '78%', left: '92%', size: 5, duration: 8.5, delay: 0.8, color: '#3b82f6' },
  { id: 7, top: '15%', left: '55%', size: 6, duration: 12, delay: 2.7, color: '#f59e0b' },
  { id: 8, top: '88%', left: '45%', size: 8, duration: 9.5, delay: 1.5, color: '#a855f7' },
  { id: 9, top: '58%', left: '38%', size: 5, duration: 8, delay: 3.2, color: '#3b82f6' },
  { id: 10, top: '92%', left: '12%', size: 7, duration: 10.5, delay: 0.3, color: '#f59e0b' },
];

export const GlobalBackgroundEffects: React.FC = () => {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatGem {
          0% {
            transform: translateY(0px) rotate(45deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-25px) rotate(90deg);
            opacity: 0.75;
          }
          100% {
            transform: translateY(-50px) rotate(135deg);
            opacity: 0.2;
          }
        }
        @keyframes pulseNebula {
          0%, 100% {
            transform: scale(1);
            opacity: 0.12;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.22;
          }
        }
      `}} />

      {/* Ambient Pulsing Glow Nebulae */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full blur-[120px] bg-vip-purple/20 pointer-events-none"
        style={{ animation: 'pulseNebula 8s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[130px] bg-vip-blue/20 pointer-events-none"
        style={{ animation: 'pulseNebula 10s ease-in-out infinite 2s' }}
      />
      <div
        className="absolute top-[45%] left-[30%] w-[450px] h-[450px] rounded-full blur-[140px] bg-vip-gold/10 pointer-events-none"
        style={{ animation: 'pulseNebula 9s ease-in-out infinite 4s' }}
      />

      {/* Floating Diamond Sparkle Gems */}
      {BACKGROUND_ORBS.map((orb) => (
        <span
          key={orb.id}
          className="absolute pointer-events-none"
          style={{
            top: orb.top,
            left: orb.left,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            backgroundColor: orb.color,
            boxShadow: `0 0 10px ${orb.color}, 0 0 20px ${orb.color}`,
            transform: 'rotate(45deg)', // Diamond icon
            animation: `floatGem ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default GlobalBackgroundEffects;
