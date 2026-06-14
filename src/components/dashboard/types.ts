// ─── Types ───────────────────────────────────────────────────────────────────

export type Section = "dashboard" | "devices" | "monitor" | "alerts" | "history" | "settings" | "api";

export interface Device {
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

export interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  device: string;
  time: string;
}

export interface HistoryEntry {
  id: string;
  command: string;
  device: string;
  user: string;
  time: string;
  status: "success" | "fail" | "pending";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const DEVICES: Device[] = [
  { id: "DEV-001", name: "Узел Альфа", status: "online", distance: 320, signal: 87, lat: 55.75, lng: 37.62, lastSeen: "сейчас", battery: 92, temp: 38 },
  { id: "DEV-002", name: "Узел Бета", status: "online", distance: 850, signal: 72, lat: 55.76, lng: 37.64, lastSeen: "1 мин", battery: 67, temp: 42 },
  { id: "DEV-003", name: "Узел Гамма", status: "warning", distance: 1200, signal: 45, lat: 55.74, lng: 37.60, lastSeen: "3 мин", battery: 31, temp: 55 },
  { id: "DEV-004", name: "Узел Дельта", status: "offline", distance: 1480, signal: 0, lat: 55.77, lng: 37.66, lastSeen: "47 мин", battery: 8, temp: 0 },
  { id: "DEV-005", name: "Ретранслятор-1", status: "online", distance: 650, signal: 94, lat: 55.755, lng: 37.63, lastSeen: "сейчас", battery: 100, temp: 35 },
];

export const ALERTS: Alert[] = [
  { id: "A1", type: "error", message: "Потеря связи с устройством", device: "DEV-004", time: "18:32" },
  { id: "A2", type: "warning", message: "Низкий заряд батареи (31%)", device: "DEV-003", time: "18:28" },
  { id: "A3", type: "warning", message: "Высокая температура процессора (55°C)", device: "DEV-003", time: "18:15" },
  { id: "A4", type: "info", message: "Устройство подключено к сети", device: "DEV-005", time: "17:45" },
  { id: "A5", type: "info", message: "Плановое обновление прошивки завершено", device: "DEV-001", time: "16:00" },
];

export const HISTORY: HistoryEntry[] = [
  { id: "H1", command: "ACTIVATE_BEAM", device: "DEV-001", user: "admin", time: "18:30:12", status: "success" },
  { id: "H2", command: "SET_FREQUENCY 2.4GHz", device: "DEV-002", user: "operator", time: "18:25:44", status: "success" },
  { id: "H3", command: "PING", device: "DEV-004", user: "admin", time: "18:22:01", status: "fail" },
  { id: "H4", command: "SET_POWER 85", device: "DEV-003", user: "admin", time: "18:10:33", status: "success" },
  { id: "H5", command: "CALIBRATE", device: "DEV-001", user: "operator", time: "18:05:20", status: "success" },
  { id: "H6", command: "GET_TELEMETRY", device: "DEV-002", user: "api-key-1", time: "18:00:00", status: "success" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const statusColor = (s: Device["status"]) =>
  s === "online" ? "#22c55e" : s === "warning" ? "#f97316" : "#ef4444";

export const statusLabel = (s: Device["status"]) =>
  s === "online" ? "ОНЛАЙН" : s === "warning" ? "ВНИМАНИЕ" : "ОФЛАЙН";
