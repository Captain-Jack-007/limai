'use client';

import { useRef, useEffect } from 'react';

const CSS = 56;
const HALF = CSS / 2;
const TWINKLE_RATE = 0.08;
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;

interface Particle {
  theta: number;
  phi: number;
  baseR: number;
  size: number;
  baseAlpha: number;
  layer: 'core' | 'mid' | 'outer';
  twinkle: boolean;
  twinklePhase: number;
}

function rand(min: number, max: number) { return min + Math.random() * (max - min); }

function buildMiniParticles(): Particle[] {
  const ps: Particle[] = [];
  const shells: [number, number, number, number, number, number, 'core' | 'mid' | 'outer'][] = [
    [0, 8, 30, 1.2, 2.0, 0.8, 'core'],
    [8, 16, 50, 0.5, 1.0, 0.4, 'mid'],
    [16, 22, 40, 0.3, 0.7, 0.12, 'outer'],
  ];
  for (const [minR, maxR, count, minSz, maxSz, minA, layer] of shells) {
    for (let i = 0; i < count; i++) {
      ps.push({
        baseR: rand(minR, maxR),
        theta: Math.acos(2 * Math.random() - 1),
        phi: Math.random() * 2 * Math.PI,
        size: rand(minSz, maxSz),
        baseAlpha: rand(minA, minA + 0.25),
        layer,
        twinkle: Math.random() < TWINKLE_RATE,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }
  return ps;
}

export default function MiniParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (particlesRef.current.length === 0) {
      particlesRef.current = buildMiniParticles();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CSS * dpr;
    canvas.height = CSS * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const particles = particlesRef.current;
    let frameId: number;
    let lastFrameTime = 0;

    function draw(ts: number) {
      frameId = requestAnimationFrame(draw);
      if (ts - lastFrameTime < FRAME_MS) return;
      lastFrameTime = ts;

      if (!ctx) return;
      const rot = (ts / 28000) * 2 * Math.PI;
      const breathe = Math.sin(ts / 4500);

      ctx.clearRect(0, 0, CSS, CSS);

      const grd = ctx.createRadialGradient(HALF, HALF, 0, HALF, HALF, 25);
      grd.addColorStop(0, 'rgba(255,255,255,0.07)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, CSS, CSS);

      const projected = particles.map((p) => {
        const r = p.baseR * (1 + 0.03 * breathe);
        const sinT = Math.sin(p.theta);
        const x3 = r * sinT * Math.cos(p.phi + rot);
        const y3 = r * Math.cos(p.theta);
        const z3 = r * sinT * Math.sin(p.phi + rot);
        return { p, x3, y3, z3 };
      });
      projected.sort((a, b) => a.z3 - b.z3);

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      for (const { p, x3, y3, z3 } of projected) {
        const maxR = p.layer === 'core' ? 8 : p.layer === 'mid' ? 16 : 22;
        const zNorm = (z3 / (maxR * 1.05) + 1) / 2;
        const twinkFactor = p.twinkle
          ? 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(ts / 700 + p.twinklePhase))
          : 1;
        const alpha = p.baseAlpha * (0.3 + 0.7 * zNorm) * twinkFactor;

        ctx.beginPath();
        ctx.arc(HALF + x3, HALF + y3, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }
    }

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: CSS, height: CSS, display: 'block' }}
    />
  );
}
