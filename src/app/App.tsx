import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { SiteImportPage } from "./components/SiteImportPage";

export default function App() {
  const [dark, setDark] = useState(false);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans SC', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
        background: "#F5F6FA",
        overflow: "hidden",
      }}
    >
      <Header />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar dark={dark} onToggle={() => setDark((d) => !d)} />
        <SiteImportPage />
      </div>
    </div>
  );
}
