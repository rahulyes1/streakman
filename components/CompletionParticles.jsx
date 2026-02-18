"use client";

import { useEffect } from "react";

const DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 0.7, y: -0.7 },
  { x: 1, y: 0 },
  { x: 0.7, y: 0.7 },
  { x: 0, y: 1 },
  { x: -0.7, y: 0.7 },
  { x: -1, y: 0 },
  { x: -0.7, y: -0.7 },
];

const DISTANCES = [24, 28, 32, 36, 40, 26, 34, 30];

export default function CompletionParticles({ x, y, color = "#5eead4", active, onComplete }) {
  const particles = active
    ? DIRECTIONS.map((direction, index) => ({
        id: `${index}-${DISTANCES[index]}`,
        dx: direction.x * DISTANCES[index],
        dy: direction.y * DISTANCES[index],
      }))
    : [];

  useEffect(() => {
    if (!active) return undefined;

    const timer = window.setTimeout(() => {
      onComplete?.();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || !particles.length) return null;

  return (
    <>
      <style>{`
        @keyframes particleBurst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + var(--dx)),
              calc(-50% + var(--dy))
            ) scale(0.6);
          }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              backgroundColor: color,
              animation: "particleBurst 220ms ease-out forwards",
              "--dx": `${particle.dx}px`,
              "--dy": `${particle.dy}px`,
            }}
          />
        ))}
      </div>
    </>
  );
}
