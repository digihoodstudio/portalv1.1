'use client';

import { useEffect, useRef } from 'react';

interface Orb {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  opacity: number;
}

export default function FloatingOrbs({ count = 4 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Orb[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let running = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 1);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    orbsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 80 + Math.random() * 120,
      speed: 0.08 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.08 + Math.random() * 0.08,
    }));

    let time = 0;
    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      time += 0.004;

      for (const orb of orbsRef.current) {
        const tx = Math.sin(time * orb.speed + orb.phase) * 50;
        const ty = Math.cos(time * orb.speed * 0.7 + orb.phase * 1.3) * 35;
        const cx = orb.x + tx;
        const cy = orb.y + ty;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.size);
        gradient.addColorStop(0, `rgba(207,199,186,${orb.opacity})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, orb.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
