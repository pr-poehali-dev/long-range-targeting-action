import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Device, statusColor } from "./types";

// ─── Mini line chart ──────────────────────────────────────────────────────────

export function MiniChart({ color = "#00d4dc", height = 40 }: { color?: string; height?: number }) {
  const points = useRef<number[]>(
    Array.from({ length: 20 }, () => 20 + Math.random() * 60)
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      points.current = [...points.current.slice(1), 20 + Math.random() * 60];
      setTick(x => x + 1);
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const w = 120, h = height;
  const pts = points.current;
  const max = Math.max(...pts), min = Math.min(...pts);
  const range = max - min || 1;

  const path = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const areaPath = path + ` L${w},${h} L0,${h} Z`;
  const gid = `g${color.replace("#", "")}${tick}`;

  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Big realtime chart ───────────────────────────────────────────────────────

export function RealtimeChart() {
  const [data, setData] = useState<{ t: number; v1: number; v2: number }[]>(
    Array.from({ length: 40 }, (_, i) => ({
      t: i,
      v1: 40 + Math.random() * 50,
      v2: 20 + Math.random() * 30,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => [
        ...prev.slice(1),
        { t: prev[prev.length - 1].t + 1, v1: 40 + Math.random() * 50, v2: 20 + Math.random() * 30 },
      ]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const w = 600, h = 140;
  const maxV = 100, minV = 0;

  const toPath = (vals: number[]) =>
    vals
      .map((v, i) => {
        const x = (i / (vals.length - 1)) * w;
        const y = h - ((v - minV) / (maxV - minV)) * (h - 10) - 5;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  const path1 = toPath(data.map(d => d.v1));
  const path2 = toPath(data.map(d => d.v2));

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: h }}>
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00d4dc" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00d4dc" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map(y => (
        <line key={y} x1={0} y1={h - (y / 100) * (h - 10) - 5} x2={w} y2={h - (y / 100) * (h - 10) - 5}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      <path d={path1 + ` L${w},${h} L0,${h} Z`} fill="url(#grad1)" />
      <path d={path2 + ` L${w},${h} L0,${h} Z`} fill="url(#grad2)" />
      <path d={path1} fill="none" stroke="#00d4dc" strokeWidth="2" />
      <path d={path2} fill="none" stroke="#22c55e" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Device Map ───────────────────────────────────────────────────────────────

export function DeviceMap({ devices, selected, onSelect }: {
  devices: Device[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const w = 500, h = 260;
  const latMin = 55.73, latMax = 55.78, lngMin = 37.58, lngMax = 37.68;

  const toX = (lng: number) => ((lng - lngMin) / (lngMax - lngMin)) * (w - 40) + 20;
  const toY = (lat: number) => h - ((lat - latMin) / (latMax - latMin)) * (h - 40) - 20;

  const center = { lat: 55.755, lng: 37.63 };
  const cx = toX(center.lng), cy = toY(center.lat);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ height: h }}>
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`hg${i}`} x1={0} y1={(h / 5) * i} x2={w} y2={(h / 5) * i}
          stroke="rgba(0,212,220,0.06)" strokeWidth="1" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`vg${i}`} x1={(w / 7) * i} y1={0} x2={(w / 7) * i} y2={h}
          stroke="rgba(0,212,220,0.06)" strokeWidth="1" />
      ))}
      {[0.25, 0.5, 0.75, 1].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * 90}
          fill="none" stroke="rgba(0,212,220,0.08)" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      <text x={cx + 92} y={cy + 4} fill="rgba(0,212,220,0.3)" fontSize="8" fontFamily="IBM Plex Mono">1500м</text>
      <text x={cx + 47} y={cy + 4} fill="rgba(0,212,220,0.25)" fontSize="8" fontFamily="IBM Plex Mono">750м</text>
      {devices.map(d => (
        <line key={d.id}
          x1={cx} y1={cy} x2={toX(d.lng)} y2={toY(d.lat)}
          stroke={statusColor(d.status)} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="3 3" />
      ))}
      <circle cx={cx} cy={cy} r={6} fill="rgba(0,212,220,0.2)" stroke="#00d4dc" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={2} fill="#00d4dc" />
      <text x={cx + 10} y={cy + 4} fill="#00d4dc" fontSize="9" fontFamily="IBM Plex Mono">BASE</text>
      {devices.map(d => {
        const x = toX(d.lng), y = toY(d.lat);
        const color = statusColor(d.status);
        const isSel = selected === d.id;
        return (
          <g key={d.id} style={{ cursor: "pointer" }} onClick={() => onSelect(d.id)}>
            {isSel && <circle cx={x} cy={y} r={14} fill={color} fillOpacity="0.15" />}
            <circle cx={x} cy={y} r={isSel ? 7 : 5} fill={color} fillOpacity="0.2" stroke={color} strokeWidth={isSel ? 2 : 1.5} />
            <circle cx={x} cy={y} r={2.5} fill={color} />
            <text x={x + 9} y={y + 4} fill={color} fontSize="9" fontFamily="IBM Plex Mono">{d.id}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

export function StatCard({ label, value, unit, color = "#00d4dc", icon, trend }: {
  label: string; value: string | number; unit?: string; color?: string; icon: string; trend?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2 hover:border-[hsl(185_90%_50%/0.4)] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-mono uppercase tracking-wider">{label}</span>
        <Icon name={icon} size={14} style={{ color }} />
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{value}</span>
        {unit && <span className="text-muted-foreground text-xs mb-1 font-mono">{unit}</span>}
      </div>
      {trend && <span className="text-xs font-mono text-green-400">{trend}</span>}
    </div>
  );
}
