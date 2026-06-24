import { Search, Bell, ChevronDown, Globe } from "lucide-react";

export function Header() {
  return (
    <header
      style={{
        height: 56, flexShrink: 0,
        background: "#fff",
        borderBottom: "1px solid #EEF0F5",
        display: "flex", alignItems: "center",
        padding: "0 24px 0 0",
        zIndex: 20,
      }}
    >
      {/* Brand — occupies the same 200px as the sidebar */}
      <div
        style={{
          width: 200, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 16px",
          borderRight: "1px solid #EEF0F5",
          height: "100%",
        }}
      >
        {/* Solar logo mark */}
        <div
          style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #1E8CFF 0%, #0060CC 100%)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="4.5" fill="white" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const r = deg * Math.PI / 180;
              const x1 = 10 + 6.5 * Math.cos(r);
              const y1 = 10 + 6.5 * Math.sin(r);
              const x2 = 10 + 9 * Math.cos(r);
              const y2 = 10 + 9 * Math.sin(r);
              return (
                <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              );
            })}
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1D2129", lineHeight: 1.2 }}>
            光伏站管理平台
          </div>
          <div style={{ fontSize: 10, color: "#86909C", lineHeight: 1.2 }}>Solar Power Management</div>
        </div>
      </div>

      {/* Search */}
      <div
        style={{
          marginLeft: 24,
          height: 32, width: 260,
          border: "1px solid #E5E8EF",
          borderRadius: 4,
          display: "flex", alignItems: "center",
          padding: "0 10px", gap: 6,
          background: "#F7F8FA",
          flexShrink: 0,
        }}
      >
        <Search size={14} color="#C9CDD4" />
        <input
          placeholder="搜索站点、设备、工单…"
          style={{
            border: "none", background: "transparent",
            outline: "none", fontSize: 13,
            color: "#1D2129", width: "100%",
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Bell with badge */}
        <div style={{ position: "relative", cursor: "pointer", lineHeight: 0 }}>
          <Bell size={18} color="#86909C" />
          <div
            style={{
              position: "absolute", top: -5, right: -5,
              minWidth: 16, height: 16, borderRadius: 8,
              background: "#F53F3F",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: "white", fontWeight: 600,
              padding: "0 3px",
            }}
          >
            3
          </div>
        </div>

        {/* Language */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 5,
            cursor: "pointer", color: "#4E5969", fontSize: 13,
            border: "1px solid #E5E8EF", borderRadius: 4,
            padding: "5px 10px",
            userSelect: "none",
          }}
        >
          <Globe size={13} color="#86909C" />
          <span>简体中文</span>
          <ChevronDown size={12} color="#C9CDD4" />
        </div>

        {/* Avatar + name */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            cursor: "pointer", userSelect: "none",
          }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #1E8CFF 0%, #36BFFA 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "white", fontWeight: 600, flexShrink: 0,
            }}
          >
            张
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1D2129", lineHeight: 1.3 }}>
              张管理员
            </div>
            <div style={{ fontSize: 11, color: "#86909C", lineHeight: 1.3 }}>超级管理员</div>
          </div>
          <ChevronDown size={12} color="#C9CDD4" />
        </div>
      </div>
    </header>
  );
}
