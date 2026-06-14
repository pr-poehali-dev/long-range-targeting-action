import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Section, DEVICES, ALERTS, Device } from "@/components/dashboard/types";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  DashboardSection,
  DevicesSection,
  MonitorSection,
  AlertsSection,
  HistorySection,
  RecognitionSection,
  SettingsSection,
  ApiSection,
} from "@/components/dashboard/Sections";

export default function Index() {
  const [section, setSection] = useState<Section>("dashboard");
  const [selectedDevice, setSelectedDevice] = useState<string | null>("DEV-001");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cmdInput, setCmdInput] = useState("");
  const [cmdLog, setCmdLog] = useState<string[]>(["> Система готова. Введите команду."]);
  const [liveTime, setLiveTime] = useState(new Date());

  // Переопределение статусов устройств (для кнопки отключения)
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, Device["status"]>>({});

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
    { id: "recognition", label: "Распознавание", icon: "ScanSearch" },
    { id: "settings", label: "Настройки", icon: "Settings" },
    { id: "api", label: "API", icon: "Code2" },
  ];

  const handleCommand = () => {
    if (!cmdInput.trim()) return;
    const cmd = cmdInput.trim().toUpperCase();
    setCmdLog(prev => [...prev, `> ${cmd}`, `  [OK] Команда отправлена на ${selectedDevice}`]);
    setCmdInput("");
  };

  const handleShutdown = (deviceId: string) => {
    const current = deviceStatuses[deviceId] ?? DEVICES.find(d => d.id === deviceId)?.status ?? "online";
    const next: Device["status"] = current === "offline" ? "online" : "offline";
    setDeviceStatuses(prev => ({ ...prev, [deviceId]: next }));
    const cmd = next === "offline" ? "SHUTDOWN" : "POWER_ON";
    const result = next === "offline" ? "[OK] Устройство отключено" : "[OK] Устройство включено";
    setCmdLog(prev => [...prev, `> ${cmd} ${deviceId}`, `  ${result}`]);
  };

  // Устройства с применёнными переопределениями статусов
  const devicesWithStatus = DEVICES.map(d => ({
    ...d,
    status: deviceStatuses[d.id] ?? d.status,
  }));

  const onlineCount = devicesWithStatus.filter(d => d.status === "online").length;

  return (
    <div className="flex h-screen overflow-hidden bg-background scanlines grid-bg">

      <Sidebar
        section={section}
        sidebarOpen={sidebarOpen}
        nav={nav}
        onSectionChange={setSection}
        onToggle={() => setSidebarOpen(x => !x)}
      />

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
              {onlineCount}/{DEVICES.length} устройств
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
          {section === "dashboard" && (
            <DashboardSection
              alertCount={alertCount}
              selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice}
              devices={devicesWithStatus}
            />
          )}
          {section === "devices" && (
            <DevicesSection
              selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice}
              cmdInput={cmdInput}
              setCmdInput={setCmdInput}
              cmdLog={cmdLog}
              setCmdLog={setCmdLog}
              handleCommand={handleCommand}
              devices={devicesWithStatus}
              onShutdown={handleShutdown}
            />
          )}
          {section === "monitor" && <MonitorSection devices={devicesWithStatus} />}
          {section === "alerts" && <AlertsSection alertCount={alertCount} />}
          {section === "history" && <HistorySection />}
          {section === "recognition" && <RecognitionSection />}
          {section === "settings" && <SettingsSection />}
          {section === "api" && <ApiSection />}
        </main>
      </div>
    </div>
  );
}