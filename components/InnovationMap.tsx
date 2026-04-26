'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import {
  type AmbientNode,
  clusters,
  type MapNode,
} from '@/lib/enterprise-data';

const VIEW_W = 1000;
const VIEW_H = 600;

type Props = {
  nodes: MapNode[];
  ambient: AmbientNode[];
  matchedIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  // Sub-industry dot selection — separate from project selection.
  selectedIndustry?: { clusterId: string; en: string } | null;
  onSelectIndustry?: (a: AmbientNode) => void;
};

export default function InnovationMap(props: Props) {
  const {
    nodes,
    ambient,
    matchedIds,
    selectedId,
    onSelect,
    selectedIndustry,
    onSelectIndustry,
  } = props;
  const { t, b } = useLang();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [time, setTime] = useState(0);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [drag, setDrag] = useState<{
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const [hover, setHover] = useState<{
    node: MapNode;
    sx: number;
    sy: number;
  } | null>(null);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setTime((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) =>
        Math.max(0.5, Math.min(4, s * (e.deltaY < 0 ? 1.12 : 1 / 1.12)))
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  function reset() {
    setScale(1);
    setTx(0);
    setTy(0);
  }

  const showProjects = scale >= 0.85;
  const showLabels = scale >= 1.6;
  const ambientAlphaMul = scale < 0.85 ? 0.5 : 1;
  // Sub-industry labels: leaders always; the rest only when zoomed in.
  const showSubLabels = scale >= 0.9;
  const showAllSubLabels = scale >= 1.5;
  const focusId = hover?.node.project.id ?? selectedId;
  const filtering = matchedIds.size > 0;

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden bg-[#05060d]"
      onMouseDown={(e) =>
        setDrag({ x: e.clientX - tx, y: e.clientY - ty, moved: false })
      }
      onMouseMove={(e) => {
        if (drag) {
          setTx(e.clientX - drag.x);
          setTy(e.clientY - drag.y);
          if (!drag.moved) setDrag({ ...drag, moved: true });
        }
      }}
      onMouseUp={() => setDrag(null)}
      onMouseLeave={() => {
        setDrag(null);
        setHover(null);
      }}
      style={{ cursor: drag ? 'grabbing' : 'grab' }}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(ellipse_at_75%_80%,rgba(236,72,153,0.14),transparent_60%),radial-gradient(ellipse_at_50%_50%,rgba(16,185,129,0.08),transparent_70%)]" />

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          {clusters.map((c) => (
            <radialGradient
              key={c.id}
              id={`g-${c.id}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={c.glow} />
              <stop offset="60%" stopColor={c.glow} stopOpacity={0.25} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          ))}
          <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
          {/* Breathing cluster halos */}
          {clusters.map((c, i) => {
            const breath = 1 + Math.sin(time * 0.6 + i * 0.7) * 0.06;
            const r = c.radius * breath;
            return (
              <g key={c.id}>
                <circle
                  cx={c.cx}
                  cy={c.cy}
                  r={r * 1.4}
                  fill={`url(#g-${c.id})`}
                  opacity={0.5}
                />
                <circle cx={c.cx} cy={c.cy} r={r} fill={`url(#g-${c.id})`} />
                <text
                  x={c.cx}
                  y={c.cy - r - 10}
                  textAnchor="middle"
                  fill="rgba(226,232,240,0.78)"
                  fontSize={scale < 0.85 ? 18 : 13}
                  fontWeight={600}
                  style={{ letterSpacing: 1, textTransform: 'uppercase' }}
                >
                  {t(c.nameKey)}
                </text>
              </g>
            );
          })}

          {/* Sub-industry dots — clickable; each represents an industry inside its cluster. */}
          <g>
            {ambient.map((a) => {
              const ox = Math.cos(time * 0.5 + a.phase) * 1.2;
              const oy = Math.sin(time * 0.7 + a.phase * 1.3) * 1.2;
              const cx = a.x + ox;
              const cy = a.y + oy;
              const labelVisible =
                (a.isLeader && showSubLabels) || showAllSubLabels;
              const fs = Math.max(6, 8 / scale);
              const isSel =
                !!selectedIndustry &&
                selectedIndustry.clusterId === a.cluster.id &&
                selectedIndustry.en === a.label.en;
              const hitR = Math.max(a.r + 6, 8);
              return (
                <g
                  key={a.id}
                  style={{ cursor: onSelectIndustry ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!drag?.moved) onSelectIndustry?.(a);
                  }}
                >
                  {/* Invisible hit target so the small dot is easy to click. */}
                  <circle cx={cx} cy={cy} r={hitR} fill="transparent" />
                  {isSel && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={a.r + 5}
                      fill="none"
                      stroke="white"
                      strokeOpacity={0.9}
                      strokeWidth={1.2}
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSel ? a.r + 1 : a.r}
                    fill={a.cluster.color}
                    opacity={(isSel ? 1 : a.alpha) * ambientAlphaMul}
                    filter="url(#nodeGlow)"
                  />
                  {labelVisible && (
                    <text
                      x={cx}
                      y={cy - a.r - 3}
                      textAnchor="middle"
                      fill={a.cluster.color}
                      fillOpacity={isSel ? 1 : a.isLeader ? 0.9 : 0.7}
                      fontSize={fs}
                      style={{
                        paintOrder: 'stroke',
                        stroke: '#05060d',
                        strokeWidth: 2 / scale,
                        strokeLinejoin: 'round',
                        pointerEvents: 'none',
                      }}
                    >
                      {b(a.label)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Project nodes (shown when zoomed in past threshold) */}
          {showProjects &&
            nodes.map((n) => {
              const dim = filtering && !matchedIds.has(n.project.id);
              const sel = n.project.id === selectedId;
              const isFocus = n.project.id === focusId;
              const ox = Math.cos(time * 0.4 + n.phase) * 0.9;
              const oy = Math.sin(time * 0.55 + n.phase * 1.2) * 0.9;
              const baseR = 4 + (n.project.score - 60) / 10;
              const r = sel ? baseR + 2 : baseR;
              const op = dim ? 0.18 : 1;
              return (
                <g
                  key={n.project.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!drag?.moved) onSelect(n.project.id);
                  }}
                  onMouseEnter={(e) => {
                    const rect = wrapRef.current?.getBoundingClientRect();
                    if (rect)
                      setHover({
                        node: n,
                        sx: e.clientX - rect.left,
                        sy: e.clientY - rect.top,
                      });
                  }}
                  onMouseMove={(e) => {
                    const rect = wrapRef.current?.getBoundingClientRect();
                    if (rect)
                      setHover({
                        node: n,
                        sx: e.clientX - rect.left,
                        sy: e.clientY - rect.top,
                      });
                  }}
                  onMouseLeave={() => setHover(null)}
                >
                  {(sel || isFocus) && (
                    <circle
                      cx={n.x + ox}
                      cy={n.y + oy}
                      r={r + 8}
                      fill="none"
                      stroke="white"
                      strokeOpacity={0.85}
                      strokeWidth={1.2}
                    />
                  )}
                  <circle
                    cx={n.x + ox}
                    cy={n.y + oy}
                    r={r + 5}
                    fill={n.cluster.glow}
                    opacity={op * 0.7}
                  />
                  <circle
                    cx={n.x + ox}
                    cy={n.y + oy}
                    r={r}
                    fill={n.cluster.color}
                    opacity={op}
                    filter="url(#nodeGlow)"
                  />
                  {showLabels && !dim && (
                    <text
                      x={n.x + ox}
                      y={n.y + oy + r + 11}
                      textAnchor="middle"
                      fill="rgba(226,232,240,0.85)"
                      fontSize={8}
                      style={{ pointerEvents: 'none' }}
                    >
                      {b(n.project.name)}
                    </text>
                  )}
                </g>
              );
            })}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-20 px-3 py-2 rounded-lg bg-[#0b1020]/95 border border-indigo-500/40 text-white text-xs shadow-[0_0_30px_rgba(99,102,241,0.35)] max-w-[260px]"
          style={{
            left: Math.min(
              hover.sx + 14,
              (wrapRef.current?.clientWidth ?? 0) - 270
            ),
            top: hover.sy + 14,
          }}
        >
          <div className="font-semibold leading-tight">
            {b(hover.node.project.name)}
          </div>
          <div className="text-slate-400 text-[11px] mt-1">
            {b(hover.node.project.industry)} · TRL {hover.node.project.trl} ·{' '}
            {hover.node.project.score}
          </div>
        </div>
      )}

      {scale < 0.85 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 backdrop-blur">
          {t('map_hint_zoomed_out')}
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-20">
        {[
          {
            icon: Plus,
            label: t('map_zoom_in'),
            fn: () => setScale((s) => Math.min(4, s * 1.25)),
          },
          {
            icon: Minus,
            label: t('map_zoom_out'),
            fn: () => setScale((s) => Math.max(0.5, s / 1.25)),
          },
          { icon: Maximize2, label: t('map_zoom_reset'), fn: reset },
        ].map(({ icon: Icon, label, fn }) => (
          <button
            key={label}
            onClick={fn}
            title={label}
            aria-label={label}
            className="w-9 h-9 grid place-items-center rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white backdrop-blur transition"
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
