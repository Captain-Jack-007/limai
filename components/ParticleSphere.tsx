'use client';

import { useRef, useEffect } from 'react';

const CSS_SIZE = 400;
const HALF = CSS_SIZE / 2;

const CORE_COUNT = 200;
const MID_COUNT = 400;
const OUTER_COUNT = 300;
const TWINKLE_RATE = 0.05;
const FRAME_MS = 1000 / 30;

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

function randShell(minR: number, maxR: number) {
  return {
    r: minR + Math.random() * (maxR - minR),
    theta: Math.acos(2 * Math.random() - 1),
    phi: Math.random() * 2 * Math.PI,
  };
}

function buildParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < CORE_COUNT; i++) {
    const { r, theta, phi } = randShell(0, 80);
    particles.push({ theta, phi, baseR: r, size: 1.5 + Math.random() * 1.5, baseAlpha: 0.8 + Math.random() * 0.2, layer: 'core', twinkle: Math.random() < TWINKLE_RATE, twinklePhase: Math.random() * Math.PI * 2 });
  }
  for (let i = 0; i < MID_COUNT; i++) {
    const { r, theta, phi } = randShell(80, 140);
    particles.push({ theta, phi, baseR: r, size: 0.7 + Math.random() * 1.1, baseAlpha: 0.4 + Math.random() * 0.3, layer: 'mid', twinkle: Math.random() < TWINKLE_RATE, twinklePhase: Math.random() * Math.PI * 2 });
  }
  for (let i = 0; i < OUTER_COUNT; i++) {
    const { r, theta, phi } = randShell(140, 180);
    particles.push({ theta, phi, baseR: r, size: 0.3 + Math.random() * 0.7, baseAlpha: 0.1 + Math.random() * 0.2, layer: 'outer', twinkle: Math.random() < TWINKLE_RATE, twinklePhase: Math.random() * Math.PI * 2 });
  }
  return particles;
}

export default function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (particlesRef.current.length === 0) {
      particlesRef.current = buildParticles();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CSS_SIZE * dpr;
    canvas.height = CSS_SIZE * dpr;

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

      const rotAngle = (ts / 25000) * 2 * Math.PI;
      const breathe = Math.sin(ts / 4000);

      ctx.clearRect(0, 0, CSS_SIZE, CSS_SIZE);

      const grd = ctx.createRadialGradient(HALF, HALF, 0, HALF, HALF, 200);
      grd.addColorStop(0, 'rgba(255,255,255,0.06)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, CSS_SIZE, CSS_SIZE);

      const projected = particles.map((p) => {
        const r = p.baseR * (1 + 0.03 * breathe);
        const sinT = Math.sin(p.theta);
        const cosT = Math.cos(p.theta);
        const rPhi = p.phi + rotAngle;
        const x3 = r * sinT * Math.cos(rPhi);
        const y3 = r * cosT;
        const z3 = r * sinT * Math.sin(rPhi);
        return { p, x3, y3, z3 };
      });
      projected.sort((a, b) => a.z3 - b.z3);

      let currentShadow = false;
      for (const { p, x3, y3, z3 } of projected) {
        const maxR = p.layer === 'core' ? 80 : p.layer === 'mid' ? 140 : 180;
        const zNorm = (z3 / (maxR * 1.05) + 1) / 2;

        let twinkFactor = 1;
        if (p.twinkle) {
          twinkFactor = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(ts / 700 + p.twinklePhase));
        }

        const alpha = p.baseAlpha * (0.35 + 0.65 * zNorm) * twinkFactor;

        if (p.layer === 'core') {
          if (!currentShadow) {
            ctx.shadowBlur = 9;
            currentShadow = true;
          }
          ctx.shadowColor = `rgba(255,255,255,${Math.min(alpha * 0.55, 0.45)})`;
        } else if (currentShadow) {
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
          currentShadow = false;
        }

        ctx.beginPath();
        ctx.arc(HALF + x3, HALF + y3, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    }

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: CSS_SIZE, height: CSS_SIZE, display: 'block', margin: '0 auto' }}
    />
  );
}
