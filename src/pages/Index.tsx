import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────

type Section = "dashboard" | "devices" | "monitor" | "alerts" | "history" | "settings" | "api";

interface Device {
  id: string;
  name: string;
  status: "online" | "offline" | "warning";
  distance: number;
  signal: number;
  lat: number;
  lng: number;
  lastSeen: string;
  battery: number;
  temp: number;
}

interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  device: string;
  time: string;
}

interface HistoryEntry {
  id: string;
  command: string;
  device: string;
  user: string;
  time: string;
  status: "success" | "fail" | "pending";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DEVICES: Device[] = [
  { id: "DEV-001", name: "Узел Альфа", status: "online", distance: 320, signal: 87, lat: 55.75, lng: 37.62, lastSeen: "сейчас", battery: 92, temp: 38 },
  { id: "DEV-002", name: "Узел Бета", status: "online", distance: 850, signal: 72, lat: 55.76, lng: 37.64, lastSeen: "1 мин", battery: 67, temp: 42 },
  { id: "DEV-003", name: "Узел Гамма", status: "warning", distance: 1200, signal: 45, lat: 55.74, lng: 37.60, lastSeen: "3 мин", battery: 31, temp: 55 },
  { id: "DEV-004", name: "Узел Дельта", status: "offline", distance: 1480, signal: 0, lat: 55.77, lng: 37.66, lastSeen: "47 мин", battery: 8, temp: 0 },
  { id: "DEV-005", name: "Ретранслятор-1", status: "online", distance: 650, signal: 94, lat: 55.755, lng: 37.63, lastSeen: "сейчас", battery: 100, temp: 35 },
];

const ALERTS: Alert[] = [
  { id: "A1", type: "error", message: "Потеря связи с устройством", device: "DEV-004", time: "18:32" },
  { id: "A2", type: "warning", message: "Низкий заряд батареи (31%)", device: "DEV-003", time: "18:28" },
  { id: "A3", type: "warning", message: "Высокая температура процессора (55°C)", device: "DEV-003", time: "18:15" },
  { id: "A4", type: "info", message: "Устройство подключено к сети", device: "DEV-005", time: "17:45" },
  { id: "A5", type: "info", message: "Плановое обновление прошивки завершено", device: "DEV-001", time: "16:00" },
];

const HISTORY: HistoryEntry[] = [
  { id: "H1", command: "ACTIVATE_BEAM", device: "DEV-001", user: "admin", time: "18:30:12", status: "success" },
  { id: "H2", command: "SET_FREQUENCY 2.4GHz", device: "DEV-002", user: "operator", time: "18:25:44", status: "success" },
  { id: "H3", command: "PING", device: "DEV-004", user: "admin", time: "18:22:01", status: "fail" },
  { id: "H4", command: "SET_POWER 85", device: "DEV-003", user: "admin", time: "18:10:33", status: "success" },
  { id: "H5", command: "CALIBRATE", device: "DEV-001", user: "operator", time: "18:05:20", status: "success" },
  { id: "H6", command: "GET_TELEMETRY", device: "DEV-002", user: "api-key-1", time: "18:00:00", status: "success" },
];

// ─── Mini line chart ──────────────────────────────────────────────────────────

function MiniChart({ color = "#00d4dc", height = 40 }: { color?: string; height?: number }) {
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

function RealtimeChart() {
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
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height }}>
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

// ─── Map ──────────────────────────────────────────────────────────────────────

function DeviceMap({ devices, selected, onSelect }: {
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

  const statusColor = (s: Device["status"]) =>
    s === "online" ? "#22c55e" : s === "warning" ? "#f97316" : "#ef4444";

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ height }}>
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

function StatCard({ label, value, unit, color = "#00d4dc", icon, trend }: {
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

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function Index() {
  const [section, setSection] = useState<Section>("dashboard");
  const [selectedDevice, setSelectedDevice] = useState<string | null>("DEV-001");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cmdInput, setCmdInput] = useState("");
  const [cmdLog, setCmdLog] = useState<string[]>(["> Система готова. Введите команду."]);
  const [liveTime, setLiveTime] = useState(new Date());
  const alertCount = ALERTS.filter(a => a.type !== "info").length;

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nav = [
    { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
    { id: "devices", label: "Устройства", icon: "Cpu" },
    { id: "monitor", label: "Мониторинг", icon: "Activity" },
    { id: "alerts", label: "Оповещения", icon: "Bell", badge: alertCount },
    { id: "history", label: "История", icon: "History" },
    { id: "settings", label: "Настройки", icon: "Settings" },
    { id: "api", label: "API", icon: "Code2" },
  ];

  const activeDevice = DEVICES.find(d => d.id === selectedDevice) || DEVICES[0];

  const handleCommand = () => {
    if (!cmdInput.trim()) return;
    const cmd = cmdInput.trim().toUpperCase();
    setCmdLog(prev => [...prev, `> ${cmd}`, `  [OK] Команда отправлена на ${selectedDevice}`]);
    setCmdInput("");
  };

  const statusColor = (s: Device["status"]) =>
    s === "online" ? "#22c55e" : s === "warning" ? "#f97316" : "#ef4444";
  const statusLabel = (s: Device["status"]) =>
    s === "online" ? "ОНЛАЙН" : s === "warning" ? "ВНИМАНИЕ" : "ОФЛАЙН";

  return (
    <div className="flex h-screen overflow-hidden bg-background scanlines grid-bg">

      {/* ── Sidebar ── */}
      <aside className={`flex flex-col border-r border-border transition-all duration-300 flex-shrink-0 ${sidebarOpen ? "w-56" : "w-14"}`} style={{ background: "hsl(220 20% 5%)" }}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <div className="w-7 h-7 rounded border flex items-center justify-center flex-shrink-0 animate-pulse-glow" style={{ borderColor: "hsl(185 90% 50%)" }}>
            <Icon name="Crosshair" size={14} style={{ color: "hsl(185 90% 50%)" }} />
          </div>
          {sidebarOpen && (
            <div className="animate-slide-in overflow-hidden">
              <div className="text-xs font-mono font-bold tracking-[0.15em]" style={{ color: "hsl(185 90% 50%)" }}>LONGREACH</div>
              <div className="text-[9px] font-mono text-muted-foreground tracking-wider">v2.4.1 · 1500м</div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
          {nav.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id as Section)}
              className={`flex items-center gap-3 px-2 py-2.5 rounded text-sm transition-all duration-150 w-full relative
                ${section === item.id ? "nav-active font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              <Icon name={item.icon} size={15} />
              {sidebarOpen && <span className="font-mono text-xs tracking-wide">{item.label}</span>}
              {item.badge != null && item.badge > 0 && sidebarOpen && (
                <span className="ml-auto text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 rounded px-1.5 py-0.5">
                  {item.badge}
                </span>
              )}
              {item.badge != null && item.badge > 0 && !sidebarOpen && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={() => setSidebarOpen(x => !x)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full px-1"
          >
            <Icon name={sidebarOpen ? "PanelLeftClose" : "PanelLeftOpen"} size={15} />
            {sidebarOpen && <span className="text-xs font-mono">Свернуть</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-2.5 border-b border-border flex-shrink-0" style={{ background: "hsl(220 20% 5% / 0.8)" }}>
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              {nav.find(n => n.id === section)?.label}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-green-500">СИСТЕМА АКТИВНА</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground hidden sm:block">
              {DEVICES.filter(d => d.status === "online").length}/{DEVICES.length} устройств
            </span>
            <span className="text-xs font-mono" style={{ color: "hsl(185 90% 50%)" }}>
              {liveTime.toLocaleTimeString("ru-RU")}
            </span>
            <button className="text-muted-foreground hover:text-foreground transition-colors relative">
              <Icon name="Bell" size={16} />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-mono flex items-center justify-center text-white">
                  {alertCount}
                </span>
              )}
            </button>
            <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center">
              <Icon name="User" size={13} className="text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-5">

          {/* ════════ DASHBOARD ════════ */}
          {section === "dashboard" && (
            <div className="flex flex-col gap-5 animate-fade-up">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Устройств онлайн" value={DEVICES.filter(d => d.status === "online").length} unit={`/ ${DEVICES.length}`} icon="Cpu" color="#22c55e" trend="↑ стабильно" />
                <StatCard label="Макс. дальность" value="1480" unit="м" icon="Radar" color="#00d4dc" />
                <StatCard label="Средний сигнал" value="75" unit="%" icon="Signal" color="#00d4dc" trend="↓ -3% за час" />
                <StatCard label="Активных тревог" value={alertCount} icon="AlertTriangle" color="#f97316" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Icon name="Map" size={13} style={{ color: "hsl(185 90% 50%)" }} />
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Карта объектов</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">55.75°N 37.62°E</span>
                  </div>
                  <div className="p-3" style={{ background: "hsl(220 20% 7%)" }}>
                    <DeviceMap devices={DEVICES} selected={selectedDevice} onSelect={setSelectedDevice} />
                  </div>
                  <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border">
                    {(["online", "warning", "offline"] as Device["status"][]).map(s => (
                      <div key={s} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: statusColor(s) }} />
                        <span className="text-[10px] font-mono text-muted-foreground">{statusLabel(s)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Статус устройств</span>
                  </div>
                  <div className="divide-y divide-border">
                    {DEVICES.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDevice(d.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left ${selectedDevice === d.id ? "bg-secondary/30" : ""}`}
                      >
                        <div className="relative flex-shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full block" style={{ background: statusColor(d.status) }} />
                          {d.status === "online" && <span className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping-dot" style={{ background: statusColor(d.status) }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono font-medium truncate">{d.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{d.id} · {d.distance}м</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-mono" style={{ color: statusColor(d.status) }}>{d.signal}%</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{d.lastSeen}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Icon name="Activity" size={13} style={{ color: "hsl(185 90% 50%)" }} />
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Телеметрия · Реальное время</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-400 inline-block rounded" />Сигнал</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-green-500 inline-block rounded" />Мощность</span>
                    <span className="flex items-center gap-1.5 text-green-400">● LIVE</span>
                  </div>
                </div>
                <div className="p-4"><RealtimeChart /></div>
              </div>
            </div>
          )}

          {/* ════════ DEVICES ════════ */}
          {section === "devices" && (
            <div className="flex flex-col gap-4 animate-fade-up">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Список</span>
                    <button className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                      <Icon name="Plus" size={12} /> Добавить
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {DEVICES.map(d => (
                      <button key={d.id} onClick={() => setSelectedDevice(d.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left ${selectedDevice === d.id ? "bg-[hsl(185_90%_50%/0.07)] border-l-2 border-[hsl(185_90%_50%)]" : ""}`}>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: statusColor(d.status) }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono font-medium truncate">{d.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{d.id}</div>
                        </div>
                        <Icon name="ChevronRight" size={12} className="text-muted-foreground flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-3">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-lg font-mono font-bold" style={{ color: "hsl(185 90% 50%)" }}>{activeDevice.name}</div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">{activeDevice.id} · {activeDevice.distance}м от базы</div>
                      </div>
                      <span className="text-xs font-mono px-2 py-1 rounded border"
                        style={{ color: statusColor(activeDevice.status), borderColor: statusColor(activeDevice.status) + "50", background: statusColor(activeDevice.status) + "15" }}>
                        {statusLabel(activeDevice.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Сигнал", value: `${activeDevice.signal}%`, icon: "Signal" },
                        { label: "Батарея", value: `${activeDevice.battery}%`, icon: "Battery" },
                        { label: "Темп.", value: `${activeDevice.temp}°C`, icon: "Thermometer" },
                        { label: "Последний сеанс", value: activeDevice.lastSeen, icon: "Clock" },
                      ].map(item => (
                        <div key={item.label} className="bg-secondary/40 rounded p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Icon name={item.icon} size={11} className="text-muted-foreground" />
                            <span className="text-[10px] font-mono text-muted-foreground">{item.label}</span>
                          </div>
                          <div className="text-sm font-mono font-bold" style={{ color: "hsl(185 90% 50%)" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Icon name="Terminal" size={13} style={{ color: "hsl(185 90% 50%)" }} />
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Терминал · {activeDevice.id}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {["PING", "ACTIVATE", "CALIBRATE", "STATUS"].map(cmd => (
                          <button key={cmd}
                            onClick={() => setCmdLog(p => [...p, `> ${cmd}`, `  [OK] Отправлено на ${selectedDevice}`])}
                            className="text-[9px] font-mono px-2 py-0.5 rounded border border-border hover:border-[hsl(185_90%_50%/0.5)] hover:text-[hsl(185_90%_50%)] transition-colors text-muted-foreground">
                            {cmd}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="font-mono text-xs p-3 h-36 overflow-auto flex flex-col gap-0.5" style={{ background: "hsl(220 20% 5%)" }}>
                      {cmdLog.slice(-10).map((line, i) => (
                        <div key={i} className={line.startsWith(">") ? "text-foreground" : "text-green-400/80"}>{line}</div>
                      ))}
                      <div className="flex items-center gap-1 mt-1">
                        <span style={{ color: "hsl(185 90% 50%)" }}>›</span>
                        <span className="animate-blink" style={{ color: "hsl(185 90% 50%)" }}>_</span>
                      </div>
                    </div>
                    <div className="border-t border-border flex">
                      <input value={cmdInput} onChange={e => setCmdInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleCommand()}
                        placeholder="Введите команду..."
                        className="flex-1 bg-transparent px-4 py-2.5 text-xs font-mono outline-none placeholder:text-muted-foreground/40" />
                      <button onClick={handleCommand}
                        className="px-4 text-xs font-mono border-l border-border hover:bg-secondary transition-colors"
                        style={{ color: "hsl(185 90% 50%)" }}>
                        ОТПР
                      </button>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Параметры</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { label: "Частота", value: "2.4 GHz", editable: true },
                        { label: "Мощность сигнала", value: "85 dBm", editable: true },
                        { label: "Режим работы", value: "АКТИВНЫЙ", editable: false },
                        { label: "Шифрование", value: "AES-256", editable: false },
                      ].map(p => (
                        <div key={p.label} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2">
                          <span className="text-[11px] font-mono text-muted-foreground">{p.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono" style={{ color: "hsl(185 90% 50%)" }}>{p.value}</span>
                            {p.editable && <Icon name="Pencil" size={10} className="text-muted-foreground hover:text-foreground cursor-pointer" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ MONITOR ════════ */}
          {section === "monitor" && (
            <div className="flex flex-col gap-4 animate-fade-up">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {DEVICES.map(d => (
                  <div key={d.id} className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{d.id}</span>
                      <span className="w-2 h-2 rounded-full" style={{ background: statusColor(d.status) }} />
                    </div>
                    <div className="text-xs font-mono font-medium mb-2 truncate">{d.name}</div>
                    <MiniChart color={statusColor(d.status)} />
                    <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
                      <span style={{ color: statusColor(d.status) }}>{d.signal}%</span>
                      <span>{d.distance}м</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Icon name="Activity" size={13} style={{ color: "hsl(185 90% 50%)" }} />
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Сводный мониторинг</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-green-400">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />LIVE
                  </span>
                </div>
                <div className="p-4"><RealtimeChart /></div>
                <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                  {[
                    { label: "Пакетов/с", value: "1,247" },
                    { label: "Задержка", value: "12 мс" },
                    { label: "Потери", value: "0.2%" },
                  ].map(m => (
                    <div key={m.label} className="px-4 py-3 text-center">
                      <div className="text-lg font-mono font-bold" style={{ color: "hsl(185 90% 50%)" }}>{m.value}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ ALERTS ════════ */}
          {section === "alerts" && (
            <div className="flex flex-col gap-3 animate-fade-up">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-mono text-muted-foreground">{ALERTS.length} событий · {alertCount} требуют внимания</div>
                <button className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  <Icon name="CheckCheck" size={12} /> Отметить прочитанными
                </button>
              </div>
              {ALERTS.map(a => {
                const color = a.type === "error" ? "#ef4444" : a.type === "warning" ? "#f97316" : "#00d4dc";
                const icon = a.type === "error" ? "AlertCircle" : a.type === "warning" ? "AlertTriangle" : "Info";
                return (
                  <div key={a.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-start gap-4 hover:border-[hsl(185_90%_50%/0.3)] transition-colors">
                    <Icon name={icon} size={16} style={{ color, flexShrink: 0, marginTop: 1 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono">{a.message}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-1">{a.device}</div>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{a.time}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ════════ HISTORY ════════ */}
          {section === "history" && (
            <div className="flex flex-col gap-3 animate-fade-up">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Журнал команд</span>
                  <button className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    <Icon name="Download" size={11} /> Экспорт
                  </button>
                </div>
                <div className="divide-y divide-border overflow-x-auto">
                  {HISTORY.map(h => {
                    const sc = h.status === "success" ? "#22c55e" : h.status === "fail" ? "#ef4444" : "#f97316";
                    const sl = h.status === "success" ? "УСПЕХ" : h.status === "fail" ? "ОШИБКА" : "ОЖИДАНИЕ";
                    return (
                      <div key={h.id} className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors min-w-max">
                        <span className="text-[10px] font-mono text-muted-foreground w-16">{h.time}</span>
                        <span className="font-mono text-sm flex-1" style={{ color: "hsl(185 90% 50%)" }}>{h.command}</span>
                        <span className="text-[10px] font-mono text-muted-foreground w-20">{h.device}</span>
                        <span className="text-[10px] font-mono text-muted-foreground w-16">{h.user}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border"
                          style={{ color: sc, borderColor: sc + "40", background: sc + "10" }}>{sl}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════════ SETTINGS ════════ */}
          {section === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up">
              {[
                {
                  title: "Системные параметры", icon: "Settings",
                  fields: [
                    { label: "Имя системы", value: "LONGREACH-1" },
                    { label: "Макс. дальность", value: "1500 м" },
                    { label: "Интервал опроса", value: "5 сек" },
                    { label: "Таймаут соединения", value: "30 сек" },
                  ]
                },
                {
                  title: "Уведомления", icon: "Bell",
                  fields: [
                    { label: "Email оповещения", value: "admin@company.ru" },
                    { label: "SMS при потере связи", value: "Включено" },
                    { label: "Webhook URL", value: "https://hooks.example.com/..." },
                    { label: "Порог сигнала тревоги", value: "< 30%" },
                  ]
                },
                {
                  title: "Безопасность", icon: "Shield",
                  fields: [
                    { label: "Шифрование", value: "AES-256-GCM" },
                    { label: "Протокол", value: "TLS 1.3" },
                    { label: "Ротация ключей", value: "24 часа" },
                    { label: "2FA", value: "Включено" },
                  ]
                },
                {
                  title: "Пользователи", icon: "Users",
                  fields: [
                    { label: "Администратор", value: "admin" },
                    { label: "Операторов", value: "3" },
                    { label: "Длина сессии", value: "8 часов" },
                    { label: "Аудит действий", value: "Включено" },
                  ]
                },
              ].map(block => (
                <div key={block.title} className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
                    <Icon name={block.icon} size={13} style={{ color: "hsl(185 90% 50%)" }} />
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{block.title}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-2.5">
                    {block.fields.map(f => (
                      <div key={f.label} className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">{f.label}</span>
                        <span className="text-xs font-mono" style={{ color: "hsl(185 90% 50%)" }}>{f.value}</span>
                      </div>
                    ))}
                    <button className="mt-2 text-xs font-mono text-muted-foreground hover:text-foreground border border-border rounded px-3 py-1.5 hover:border-[hsl(185_90%_50%/0.4)] transition-colors text-left">
                      Изменить настройки →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ════════ API ════════ */}
          {section === "api" && (
            <div className="flex flex-col gap-4 animate-fade-up">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard label="Запросов сегодня" value="24,831" icon="Zap" color="#00d4dc" trend="↑ +12% к вчера" />
                <StatCard label="Активных ключей" value="3" icon="Key" color="#22c55e" />
                <StatCard label="Среднее время ответа" value="47" unit="мс" icon="Timer" color="#00d4dc" />
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
                  <Icon name="Key" size={13} style={{ color: "hsl(185 90% 50%)" }} />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">API ключи</span>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { key: "lr_live_••••••••7f3a", name: "Производство", created: "01.01.2026", requests: "21,445", active: true },
                    { key: "lr_live_••••••••2b9c", name: "Мониторинг", created: "15.02.2026", requests: "3,120", active: true },
                    { key: "lr_test_••••••••4d1e", name: "Разработка", created: "10.03.2026", requests: "266", active: false },
                  ].map(k => (
                    <div key={k.key} className="flex items-center gap-4 px-4 py-3">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: k.active ? "#22c55e" : "#6b7280" }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono">{k.name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{k.key}</div>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground text-right hidden sm:block">
                        <div>{k.requests} запросов</div>
                        <div>с {k.created}</div>
                      </div>
                      <button className="text-muted-foreground hover:text-red-400 transition-colors ml-2">
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-border">
                  <button className="text-xs font-mono flex items-center gap-1.5" style={{ color: "hsl(185 90% 50%)" }}>
                    <Icon name="Plus" size={12} /> Создать новый ключ
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
                  <Icon name="Code2" size={13} style={{ color: "hsl(185 90% 50%)" }} />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Эндпоинты</span>
                </div>
                <div className="p-4 flex flex-col gap-2.5">
                  {[
                    { method: "GET", path: "/api/v1/devices", desc: "Список всех устройств" },
                    { method: "POST", path: "/api/v1/devices/{id}/command", desc: "Отправить команду" },
                    { method: "GET", path: "/api/v1/telemetry/{id}", desc: "Телеметрия устройства" },
                    { method: "GET", path: "/api/v1/alerts", desc: "Активные оповещения" },
                    { method: "POST", path: "/api/v1/webhook/subscribe", desc: "Подписка на события" },
                  ].map(e => (
                    <div key={e.path} className="flex items-center gap-3 bg-secondary/30 rounded px-3 py-2.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded flex-shrink-0"
                        style={{
                          color: e.method === "GET" ? "#22c55e" : "#f97316",
                          background: (e.method === "GET" ? "#22c55e" : "#f97316") + "15",
                          border: `1px solid ${(e.method === "GET" ? "#22c55e" : "#f97316")}30`
                        }}>
                        {e.method}
                      </span>
                      <span className="text-xs font-mono flex-1 min-w-0 truncate" style={{ color: "hsl(185 90% 50%)" }}>{e.path}</span>
                      <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0 hidden sm:block">{e.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}