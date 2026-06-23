'use client';

import { useRef, useCallback, useState, type ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltDegree?: number;
  glare?: boolean;
  borderRadius?: string;
}

export default function TiltCard({
  children,
  className = '',
  tiltDegree = 4,
  glare = true,
  borderRadius = '28px',
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [{ rotateX, rotateY }, setRotate] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setRotate({
        rotateX: (y - 0.5) * -tiltDegree,
        rotateY: (x - 0.5) * tiltDegree,
      });
      setGlarePos({ x: x * 100, y: y * 100 });
    });
  }, [tiltDegree]);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRotate({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
        willChange: 'transform',
        borderRadius,
      }}
      className={`${className} relative`}
    >
      {children}
      {glare && isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            borderRadius,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(207,199,186,0.1), transparent 60%)`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
}
