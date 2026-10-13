'use client';

import React from 'react';

// 24 deterministic floating diamond sparkles & golden embers
const FLOATING_GEMS = [
  { id: 1, top: '5%', left: '8%', size: 7, duration: 7, delay: 0, color: '#fbbf24' },
  { id: 2, top: '18%', left: '88%', size: 9, duration: 8.5, delay: 1.2, color: '#a855f7' },
  { id: 3, top: '28%', left: '4%', size: 6, duration: 10, delay: 0.5, color: '#06b6d4' },
  { id: 4, top: '42%', left: '84%', size: 8, duration: 6.8, delay: 2.1, color: '#f59e0b' },
  { id: 5, top: '58%', left: '14%', size: 7, duration: 9.2, delay: 1.8, color: '#a855f7' },
  { id: 6, top: '72%', left: '94%', size: 6, duration: 8, delay: 0.8, color: '#3b82f6' },
  { id: 7, top: '12%', left: '52%', size: 8, duration: 11, delay: 2.7, color: '#fbbf24' },
  { id: 8, top: '85%', left: '48%', size: 10, duration: 9, delay: 1.5, color: '#a855f7' },
  { id: 9, top: '52%', left: '32%', size: 5, duration: 7.5, delay: 3.2, color: '#06b6d4' },
  { id: 10, top: '90%', left: '8%', size: 8, duration: 10, delay: 0.3, color: '#fbbf24' },
  { id: 11, top: '2%', left: '35%', size: 6, duration: 8.2, delay: 1.6, color: '#f59e0b' },
  { id: 12, top: '34%', left: '68%', size: 7, duration: 9.8, delay: 2.4, color: '#a855f7' },
  { id: 13, top: '64%', left: '80%', size: 8, duration: 7.4, delay: 0.9, color: '#fbbf24' },
  { id: 14, top: '76%', left: '26%', size: 6, duration: 10.5, delay: 3.5, color: '#3b82f6' },
  { id: 15, top: '24%', left: '20%', size: 7, duration: 8.8, delay: 1.1, color: '#a855f7' },
  { id: 16, top: '48%', left: '58%', size: 9, duration: 9.4, delay: 2.9, color: '#fbbf24' },
  { id: 17, top: '82%', left: '72%', size: 6, duration: 8.1, delay: 0.4, color: '#06b6d4' },
  { id: 18, top: '95%', left: '85%', size: 7, duration: 11.2, delay: 2.0, color: '#a855f7' },
];

export const GlobalBackgroundEffects: React.FC = () => {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatGemLuxury {
          0% {
            transform: translateY(0px) rotate(45deg) scale(0.9);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-35px) rotate(135deg) scale(1.15);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-70px) rotate(225deg) scale(0.9);
            opacity: 0.25;
          }
        }
        @keyframes pulseNebulaVibrant {
          0%, 100% {
            transform: scale(1) translate(0px, 0px);
            opacity: 0.25;
          }
          50% {
            transform: scale(1.2) translate(-20px, 20px);
            opacity: 0.45;
          }
        }
        @keyframes cyberGridDrift {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 60px;
          }
        }
        @keyframes lightBeamShift {
          0%, 100% {
            transform: rotate(-15deg) translateY(-5%);
            opacity: 0.08;
          }
          50% {
            transform: rotate(-10deg) translateY(5%);
            opacity: 0.18;
          }
        }
      `}} />

      {/* Cyber Grid Pattern at Bottom with Gradient Fade */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(168, 85, 247, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 80%)',
          animation: 'cyberGridDrift 20s linear infinite',
        }}
      />

      {/* Shimmering Diagonal Laser Light Rays */}
      <div
        className="absolute top-[-30%] left-[10%] w-[120%] h-[80%] pointer-events-none bg-gradient-to-b from-vip-purple/20 via-transparent to-vip-gold/10 blur-2xl"
        style={{
          animation: 'lightBeamShift 12s ease-in-out infinite',
        }}
      />

      {/* Ambient Pulsing Glow Nebulae */}
      <div
        className="absolute top-[-10%] right-[-8%] w-[650px] h-[650px] rounded-full blur-[140px] bg-gradient-to-br from-vip-purple/35 to-violet-900/20 pointer-events-none"
        style={{ animation: 'pulseNebulaVibrant 9s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[150px] bg-gradient-to-tr from-vip-blue/30 via-indigo-950/20 to-vip-cyan/25 pointer-events-none"
        style={{ animation: 'pulseNebulaVibrant 11s ease-in-out infinite 2s' }}
      />
      <div
        className="absolute top-[35%] left-[25%] w-[550px] h-[550px] rounded-full blur-[160px] bg-gradient-to-r from-vip-gold/20 via-amber-600/10 to-transparent pointer-events-none"
        style={{ animation: 'pulseNebulaVibrant 10s ease-in-out infinite 4s' }}
      />

      {/* 18 Floating Diamond Sparkle Gems with Luminous Halo */}
      {FLOATING_GEMS.map((gem) => (
        <span
          key={gem.id}
          className="absolute pointer-events-none"
          style={{
            top: gem.top,
            left: gem.left,
            width: `${gem.size}px`,
            height: `${gem.size}px`,
            backgroundColor: gem.color,
            boxShadow: `0 0 12px ${gem.color}, 0 0 25px ${gem.color}, 0 0 40px ${gem.color}`,
            transform: 'rotate(45deg)', // Diamond rhombic shape
            animation: `floatGemLuxury ${gem.duration}s ease-in-out infinite`,
            animationDelay: `${gem.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default GlobalBackgroundEffects;
