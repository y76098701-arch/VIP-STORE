'use client';

import React from 'react';

// 18 deterministic floating diamond sparkles & golden gems
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

// 26 rising fiery ember particles (particles fire) with combustion glow
const FIRE_PARTICLES = [
  { id: 101, left: '6%', size: 4, duration: 6.2, delay: 0.2, color: '#ff4500' },
  { id: 102, left: '12%', size: 6, duration: 7.5, delay: 1.8, color: '#ff7700' },
  { id: 103, left: '19%', size: 3.5, duration: 5.8, delay: 3.1, color: '#ffaa00' },
  { id: 104, left: '24%', size: 5, duration: 8.1, delay: 0.7, color: '#ff2200' },
  { id: 105, left: '31%', size: 6.5, duration: 6.9, delay: 2.4, color: '#ff5500' },
  { id: 106, left: '38%', size: 4, duration: 7.2, delay: 4.0, color: '#ffaa00' },
  { id: 107, left: '44%', size: 5.5, duration: 5.5, delay: 1.1, color: '#ff3700' },
  { id: 108, left: '51%', size: 7, duration: 8.6, delay: 2.9, color: '#ff9900' },
  { id: 109, left: '57%', size: 3.5, duration: 6.4, delay: 0.5, color: '#ff2200' },
  { id: 110, left: '63%', size: 6, duration: 7.8, delay: 3.7, color: '#ff7700' },
  { id: 111, left: '71%', size: 4.5, duration: 5.9, delay: 1.5, color: '#ff4500' },
  { id: 112, left: '78%', size: 5, duration: 8.3, delay: 2.2, color: '#ffbb00' },
  { id: 113, left: '85%', size: 6.5, duration: 6.7, delay: 0.9, color: '#ff2200' },
  { id: 114, left: '92%', size: 4, duration: 7.4, delay: 3.4, color: '#ff6600' },
  { id: 115, left: '97%', size: 5.5, duration: 6.1, delay: 1.9, color: '#ffaa00' },
  { id: 116, left: '15%', size: 3, duration: 5.2, delay: 4.5, color: '#ff3300' },
  { id: 117, left: '28%', size: 5.5, duration: 8.9, delay: 0.4, color: '#ff8800' },
  { id: 118, left: '35%', size: 4, duration: 6.8, delay: 2.8, color: '#ff2200' },
  { id: 119, left: '48%', size: 6, duration: 7.1, delay: 4.9, color: '#ffaa00' },
  { id: 120, left: '60%', size: 3.5, duration: 5.7, delay: 1.3, color: '#ff5500' },
  { id: 121, left: '68%', size: 7, duration: 8.0, delay: 3.0, color: '#ff9900' },
  { id: 122, left: '82%', size: 4, duration: 6.5, delay: 0.8, color: '#ff3700' },
  { id: 123, left: '89%', size: 5.5, duration: 7.6, delay: 2.6, color: '#ff7700' },
  { id: 124, left: '22%', size: 4.5, duration: 6.3, delay: 3.8, color: '#ff4500' },
  { id: 125, left: '54%', size: 5, duration: 7.9, delay: 1.7, color: '#ffbb00' },
  { id: 126, left: '75%', size: 3.5, duration: 5.4, delay: 4.2, color: '#ff2200' },
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
        @keyframes fireEmberRise {
          0% {
            transform: translateY(105vh) translateX(0px) scale(0.6);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
            transform: translateY(90vh) translateX(10px) scale(1.1);
          }
          40% {
            opacity: 0.85;
            transform: translateY(55vh) translateX(-18px) scale(0.95);
          }
          70% {
            opacity: 0.5;
            transform: translateY(25vh) translateX(15px) scale(0.75);
          }
          95% {
            opacity: 0.15;
            transform: translateY(-5vh) translateX(-22px) scale(0.4);
          }
          100% {
            transform: translateY(-15vh) translateX(-30px) scale(0.2);
            opacity: 0;
          }
        }
        @keyframes fireFlickerGlow {
          0%, 100% {
            opacity: 0.18;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.32;
            transform: scaleY(1.15);
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

      {/* Fiery Combustion Base Glow at the Bottom */}
      <div
        className="absolute -bottom-16 left-0 right-0 h-64 pointer-events-none bg-gradient-to-t from-orange-600/25 via-red-950/15 to-transparent blur-3xl"
        style={{ animation: 'fireFlickerGlow 4.5s ease-in-out infinite' }}
      />

      {/* 26 Rising Fire Ember Particles (particles fire) */}
      {FIRE_PARTICLES.map((fire) => (
        <span
          key={fire.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            bottom: '0',
            left: fire.left,
            width: `${fire.size}px`,
            height: `${fire.size * 1.25}px`,
            backgroundColor: fire.color,
            boxShadow: `0 0 8px ${fire.color}, 0 0 16px ${fire.color}, 0 0 28px rgba(255, 69, 0, 0.7)`,
            animation: `fireEmberRise ${fire.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
            animationDelay: `${fire.delay}s`,
          }}
        />
      ))}

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
