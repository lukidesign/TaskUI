import { useState } from "react";
import {
  ClipboardList, FileText, Zap, BarChart2, Layers,
  Moon, Sun, ChevronDown, ChevronRight,
} from "lucide-react";

const NAV = [
  { icon: ClipboardList, label: "巡检管理", key: "inspection" },
  { icon: FileText,      label: "工单管理",  key: "ticket" },
  { icon: Zap,           label: "节能管理",  key: "energy" },
  { icon: BarChart2,     label: "报表管理",  key: "report" },
  {
    icon: Layers, label: "资产管理", key: "asset",
    children: [
      { label: "电站管理",   key: "station", active: true },
      { label: "设备管理",   key: "device" },
      { label: "摄像头管理", key: "camera" },
    ],
  },
] as const;

export function Sidebar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState<Set<string>>(new Set(["asset"]));

  function toggle(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <aside
      style={{
        width: 200, flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid #EEF0F5",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Nav items */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const hasChildren = "children" in item;
          const isOpen = open.has(item.key);
          const parentActive = hasChildren && (item as any).children.some((c: any) => c.active);

          return (
            <div key={item.key}>
              {/* Parent row */}
              <div
                onClick={() => hasChildren && toggle(item.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: 14,
                  color: parentActive ? "#1E8CFF" : "#4E5969",
                  fontWeight: parentActive ? 500 : 400,
                  background: !hasChildren && "active" in item && (item as any).active
                    ? "#EBF3FF" : "transparent",
                  userSelect: "none" as const,
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {hasChildren && (
                  isOpen
                    ? <ChevronDown size={13} color="#C9CDD4" />
                    : <ChevronRight size={13} color="#C9CDD4" />
                )}
              </div>

              {/* Children */}
              {hasChildren && isOpen &&
                (item as any).children.map((child: any) => (
                  <div
                    key={child.key}
                    style={{
                      padding: "9px 16px 9px 41px",
                      fontSize: 13,
                      color: child.active ? "#1E8CFF" : "#86909C",
                      background: child.active ? "#EBF3FF" : "transparent",
                      fontWeight: child.active ? 500 : 400,
                      cursor: "pointer",
                      borderLeft: child.active
                        ? "2px solid #1E8CFF"
                        : "2px solid transparent",
                      userSelect: "none" as const,
                    }}
                  >
                    {child.label}
                  </div>
                ))
              }
            </div>
          );
        })}
      </nav>

      {/* Dark / Light toggle */}
      <div
        onClick={onToggle}
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #EEF0F5",
          display: "flex", alignItems: "center", gap: 8,
          cursor: "pointer", fontSize: 13, color: "#86909C",
          userSelect: "none",
        }}
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
        <span style={{ flex: 1 }}>{dark ? "浅色模式" : "深色模式"}</span>
        {/* Toggle pill */}
        <div
          style={{
            width: 34, height: 18, borderRadius: 9,
            background: dark ? "#1E8CFF" : "#C9CDD4",
            position: "relative", transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute", top: 2,
              left: dark ? 16 : 2,
              width: 14, height: 14, borderRadius: "50%",
              background: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              transition: "left 0.2s",
            }}
          />
        </div>
      </div>
    </aside>
  );
}
