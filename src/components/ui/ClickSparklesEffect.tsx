'use client';

import React, { useEffect, useState } from 'react';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

const COLORS = [
  'rgba(245, 158, 11, 0.9)', // Amber/Gold
  'rgba(168, 85, 247, 0.9)', // Purple
  'rgba(59, 130, 246, 0.9)',  // Blue
  'rgba(250, 204, 21, 0.9)', // Yellow
];

export const ClickSparklesEffect: React.FC = () => {
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);

  useEffect(() => {
    let nextId = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      if (!clientX && !clientY) return;

      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const rippleId = ++nextId;

      // 1. Add subtle glowing ripple at click point
      setRipples((prev) => [...prev.slice(-10), { id: rippleId, x: clientX, y: clientY, color: randomColor }]);

      // 2. Add 5 tiny diamond sparkle particles bursting outwards
      const newSparkles: SparkleParticle[] = [];
      const particleCount = 5;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = 25 + Math.random() * 35;
        newSparkles.push({
          id: ++nextId,
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 4,
          color: randomColor,
        });
      }

      setSparkles((prev) => [...prev.slice(-25), ...newSparkles]);

      // Clean up ripple after 600ms
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 650);

      // Clean up sparkles after 600ms
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => !newSparkles.some((ns) => ns.id === s.id)));
      }, 650);
    };

    window.addEventListener('mousedown', handlePointerDown, { passive: true });
    window.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes clickRippleAnimation {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.4);
            opacity: 0;
          }
        }
        @keyframes sparkleFade {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0) rotate(180deg);
            opacity: 0;
          }
        }
      `}} />

      {/* Expanding subtle click ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full border border-vip-gold/60 pointer-events-none"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: '42px',
            height: '42px',
            boxShadow: `0 0 15px ${ripple.color}, inset 0 0 10px ${ripple.color}`,
            animation: 'clickRippleAnimation 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
          }}
        />
      ))}

      {/* Tiny diamond particles */}
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute pointer-events-none flex items-center justify-center font-bold select-none"
          style={{
            left: `${sparkle.x}px`,
            top: `${sparkle.y}px`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: sparkle.color,
            boxShadow: `0 0 8px ${sparkle.color}`,
            transform: 'rotate(45deg)', // Diamond shape!
            animation: 'sparkleFade 0.6s ease-out forwards',
            // @ts-ignore
            '--tw-translate-x': `${sparkle.vx}px`,
            '--tw-translate-y': `${sparkle.vy}px`,
          }}
        />
      ))}
    </div>
  );
};

export default ClickSparklesEffect;
