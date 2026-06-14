import Icon from "@/components/ui/icon";
import { Section } from "./types";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarProps {
  section: Section;
  sidebarOpen: boolean;
  nav: NavItem[];
  onSectionChange: (s: Section) => void;
  onToggle: () => void;
}

export function Sidebar({ section, sidebarOpen, nav, onSectionChange, onToggle }: SidebarProps) {
  return (
    <aside
      className={`flex flex-col border-r border-border transition-all duration-300 flex-shrink-0 ${sidebarOpen ? "w-56" : "w-14"}`}
      style={{ background: "hsl(220 20% 5%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <div
          className="w-7 h-7 rounded border flex items-center justify-center flex-shrink-0 animate-pulse-glow"
          style={{ borderColor: "hsl(185 90% 50%)" }}
        >
          <Icon name="Crosshair" size={14} style={{ color: "hsl(185 90% 50%)" }} />
        </div>
        {sidebarOpen && (
          <div className="animate-slide-in overflow-hidden">
            <div className="text-xs font-mono font-bold tracking-[0.15em]" style={{ color: "hsl(185 90% 50%)" }}>LONGREACH</div>
            <div className="text-[9px] font-mono text-muted-foreground tracking-wider">v2.4.1 · 1500м</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id as Section)}
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

      {/* Footer */}
      <div className="border-t border-border p-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full px-1"
        >
          <Icon name={sidebarOpen ? "PanelLeftClose" : "PanelLeftOpen"} size={15} />
          {sidebarOpen && <span className="text-xs font-mono">Свернуть</span>}
        </button>
      </div>
    </aside>
  );
}
