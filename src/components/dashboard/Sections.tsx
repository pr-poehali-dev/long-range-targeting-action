import Icon from "@/components/ui/icon";
import { Device, Alert, HistoryEntry, DEVICES, ALERTS, HISTORY, statusColor, statusLabel } from "./types";
import { MiniChart, RealtimeChart, DeviceMap, StatCard } from "./Charts";

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function DashboardSection({
  alertCount,
  selectedDevice,
  setSelectedDevice,
  devices,
}: {
  alertCount: number;
  selectedDevice: string | null;
  setSelectedDevice: (id: string) => void;
  devices: Device[];
}) {
  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Устройств онлайн" value={devices.filter(d => d.status === "online").length} unit={`/ ${devices.length}`} icon="Cpu" color="#22c55e" trend="↑ стабильно" />
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
            <DeviceMap devices={devices} selected={selectedDevice} onSelect={setSelectedDevice} />
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
            {devices.map(d => (
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
  );
}

// ─── Devices ──────────────────────────────────────────────────────────────────

export function DevicesSection({
  selectedDevice,
  setSelectedDevice,
  cmdInput,
  setCmdInput,
  cmdLog,
  setCmdLog,
  handleCommand,
  devices,
  onShutdown,
}: {
  selectedDevice: string | null;
  setSelectedDevice: (id: string) => void;
  cmdInput: string;
  setCmdInput: (v: string) => void;
  cmdLog: string[];
  setCmdLog: (fn: (prev: string[]) => string[]) => void;
  handleCommand: () => void;
  devices: Device[];
  onShutdown: (id: string) => void;
}) {
  const activeDevice = devices.find(d => d.id === selectedDevice) || devices[0];
  const isOffline = activeDevice.status === "offline";

  return (
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
            {devices.map(d => (
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-1 rounded border"
                  style={{ color: statusColor(activeDevice.status), borderColor: statusColor(activeDevice.status) + "50", background: statusColor(activeDevice.status) + "15" }}>
                  {statusLabel(activeDevice.status)}
                </span>
                {/* ── Кнопка отключения / включения ── */}
                <button
                  onClick={() => onShutdown(activeDevice.id)}
                  className={`flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border transition-all duration-150 ${
                    isOffline
                      ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
                      : "border-red-500/40 text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  <Icon name={isOffline ? "Power" : "PowerOff"} size={11} />
                  {isOffline ? "ВКЛЮЧИТЬ" : "ОТКЛЮЧИТЬ"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Сигнал", value: `${activeDevice.signal}%`, icon: "Signal" },
                { label: "Батарея", value: `${activeDevice.battery}%`, icon: "Battery" },
                { label: "Темп.", value: `${activeDevice.temp}°C`, icon: "Thermometer" },
                { label: "Последний сеанс", value: activeDevice.lastSeen, icon: "Clock" },
              ].map(item => (
                <div key={item.label} className={`bg-secondary/40 rounded p-3 transition-opacity ${isOffline ? "opacity-40" : ""}`}>
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
                    disabled={isOffline}
                    className="text-[9px] font-mono px-2 py-0.5 rounded border border-border hover:border-[hsl(185_90%_50%/0.5)] hover:text-[hsl(185_90%_50%)] transition-colors text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed">
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
            <div className="font-mono text-xs p-3 h-36 overflow-auto flex flex-col gap-0.5" style={{ background: "hsl(220 20% 5%)" }}>
              {cmdLog.slice(-10).map((line, i) => (
                <div key={i} className={
                  line.includes("отключено") ? "text-red-400/80" :
                  line.includes("включено") ? "text-green-400/80" :
                  line.startsWith(">") ? "text-foreground" : "text-green-400/80"
                }>{line}</div>
              ))}
              <div className="flex items-center gap-1 mt-1">
                <span style={{ color: "hsl(185 90% 50%)" }}>›</span>
                <span className="animate-blink" style={{ color: "hsl(185 90% 50%)" }}>_</span>
              </div>
            </div>
            <div className="border-t border-border flex">
              <input value={cmdInput} onChange={e => setCmdInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCommand()}
                disabled={isOffline}
                placeholder={isOffline ? "Устройство отключено..." : "Введите команду..."}
                className="flex-1 bg-transparent px-4 py-2.5 text-xs font-mono outline-none placeholder:text-muted-foreground/40 disabled:opacity-40" />
              <button onClick={handleCommand}
                disabled={isOffline}
                className="px-4 text-xs font-mono border-l border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                { label: "Режим работы", value: isOffline ? "ВЫКЛЮЧЕН" : "АКТИВНЫЙ", editable: false },
                { label: "Шифрование", value: "AES-256", editable: false },
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2">
                  <span className="text-[11px] font-mono text-muted-foreground">{p.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono" style={{ color: "hsl(185 90% 50%)" }}>{p.value}</span>
                    {p.editable && !isOffline && <Icon name="Pencil" size={10} className="text-muted-foreground hover:text-foreground cursor-pointer" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Monitor ──────────────────────────────────────────────────────────────────

export function MonitorSection({ devices }: { devices: Device[] }) {
  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {devices.map(d => (
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
  );
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export function AlertsSection({ alertCount }: { alertCount: number }) {
  return (
    <div className="flex flex-col gap-3 animate-fade-up">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-mono text-muted-foreground">{ALERTS.length} событий · {alertCount} требуют внимания</div>
        <button className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <Icon name="CheckCheck" size={12} /> Отметить прочитанными
        </button>
      </div>
      {ALERTS.map((a: Alert) => {
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
  );
}

// ─── History ──────────────────────────────────────────────────────────────────

export function HistorySection() {
  return (
    <div className="flex flex-col gap-3 animate-fade-up">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Журнал команд</span>
          <button className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <Icon name="Download" size={11} /> Экспорт
          </button>
        </div>
        <div className="divide-y divide-border overflow-x-auto">
          {HISTORY.map((h: HistoryEntry) => {
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
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function SettingsSection() {
  const blocks = [
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
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up">
      {blocks.map(block => (
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
  );
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function ApiSection() {
  return (
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
  );
}
