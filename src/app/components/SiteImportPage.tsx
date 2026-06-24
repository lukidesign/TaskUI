import { useEffect, useRef, useState } from "react";
import {
  X, Download, Upload, ChevronRight, Check, RotateCw,
  CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2,
} from "lucide-react";

/* ── shared tokens ── */
const PRIMARY = "#1E8CFF";
const SUCCESS = "#00B42A";
const WARNING = "#FF7D00";
const DANGER = "#F53F3F";
const CARD_SHADOW = "0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)";
const RADIUS = 4;

type Phase = "idle" | "analyzing" | "analyzed" | "importing" | "imported";

interface ErrorRow {
  no: number;
  err: string;
  name: string;
  type: string;
  region: string;
  addr: string;
  lng: string;
  lat: string;
  owner: string;
  phone: string;
}

/* Mock error rows produced by the first (dirty) analysis */
const MOCK_ERRORS: ErrorRow[] = [
  { no: 7,  err: "电站名称重复",   name: "华东一号光伏电站", type: "集中式", region: "江苏 / 苏州", addr: "工业园区星湖街 88 号", lng: "120.6193", lat: "31.3171", owner: "王伟", phone: "138****6021" },
  { no: 23, err: "经纬度格式错误", name: "滨海分布式电站",   type: "分布式", region: "浙江 / 宁波", addr: "北仑区滨海大道 12 号", lng: "—",        lat: "29.8765", owner: "李娜", phone: "159****3387" },
  { no: 41, err: "手机号位数不足", name: "西北戈壁电站",     type: "集中式", region: "甘肃 / 酒泉", addr: "肃州区光电产业园 A3", lng: "98.5104",  lat: "39.7325", owner: "赵强", phone: "1370012" },
];

const TOTAL_ROWS = 128;

/* ── Tab bar ── */
const TABS = [
  { label: "电站总览", key: "overview" },
  { label: "站点导入", key: "import" },
  { label: "电站管理", key: "manage" },
];

function TabBar({ active, onChange }: { active: string; onChange: (k: string) => void }) {
  return (
    <div
      style={{
        height: 42, background: "#fff",
        borderBottom: "1px solid #EEF0F5",
        display: "flex", alignItems: "flex-end",
        padding: "0 24px", flexShrink: 0, zIndex: 10,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <div
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 14px", height: "100%", cursor: "pointer",
              fontSize: 13,
              color: isActive ? PRIMARY : "#86909C",
              fontWeight: isActive ? 500 : 400,
              borderBottom: isActive ? `2px solid ${PRIMARY}` : "2px solid transparent",
              userSelect: "none", whiteSpace: "nowrap",
            }}
          >
            {tab.label}
            {isActive && (
              <span
                onClick={(e) => { e.stopPropagation(); onChange("overview"); }}
                style={{ color: "#C9CDD4", lineHeight: 0 }}
              >
                <X size={12} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Top stepper ──
   current     = which step is in focus (1-based)
   currentDone = whether the *current* step has itself finished (renders green check)
   error       = the current step failed / needs attention (renders amber)            */
function Stepper({ current, currentDone, error }: { current: number; currentDone: boolean; error: boolean }) {
  const steps = ["上传文件", "数据导入", "成功导入"];
  return (
    <div
      style={{
        background: "#fff", borderRadius: RADIUS, boxShadow: CARD_SHADOW,
        padding: "18px 32px", marginBottom: 16,
        display: "flex", alignItems: "center",
      }}
    >
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current || (n === current && currentDone);
        const isError = n === current && error;
        const active = n === current && !currentDone && !error;

        const circleBg = done ? SUCCESS : isError ? WARNING : active ? PRIMARY : "#F2F3F5";
        const circleFg = done || isError || active ? "white" : "#C9CDD4";
        const labelColor = done ? SUCCESS : isError ? WARNING : active ? "#1D2129" : "#86909C";
        // the connector after this step turns green only once the step is fully done
        const connectorDone = n < current || (n === current && currentDone);

        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "0 0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 26, height: 26, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600,
                  background: circleBg, color: circleFg,
                  flexShrink: 0, transition: "all 0.25s",
                }}
              >
                {done ? <Check size={14} /> : isError ? <AlertTriangle size={13} /> : n}
              </div>
              <span style={{ fontSize: 14, fontWeight: active || isError ? 600 : 400, color: labelColor }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1, height: 2, margin: "0 18px",
                  background: connectorDone ? SUCCESS : "#EEF0F5",
                  borderRadius: 1, transition: "background 0.25s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step number badge ── */
function StepBadge({ n, done }: { n: number; done?: boolean }) {
  return (
    <div
      style={{
        width: 22, height: 22, borderRadius: "50%",
        background: done ? SUCCESS : PRIMARY,
        color: "white", fontSize: 12, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 0.2s",
      }}
    >
      {done ? <Check size={13} /> : n}
    </div>
  );
}

/* ── 下载模板（选填）── */
function DownloadCard({ downloaded, onDownload }: { downloaded: boolean; onDownload: () => void }) {
  return (
    <div style={{ background: "#fff", borderRadius: RADIUS, boxShadow: CARD_SHADOW, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 22, height: 22, borderRadius: "50%",
            background: downloaded ? "#E8FFEA" : "#EBF3FF",
            color: downloaded ? SUCCESS : PRIMARY,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {downloaded ? <Check size={13} /> : <Download size={13} />}
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1D2129" }}>下载模板</span>
        <span
          style={{
            fontSize: 12, color: "#86909C",
            background: "#F2F3F5", borderRadius: 10, padding: "1px 8px",
          }}
        >
          选填
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#86909C", lineHeight: 1.7 }}>
        若已有标准模板可直接上传；如需重新填写，可在此下载最新版导入模板。
      </p>
      <div style={{ marginTop: "auto" }}>
        <button
          onClick={onDownload}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 20px",
            border: `1px solid ${downloaded ? "#E5E8EF" : PRIMARY}`,
            borderRadius: RADIUS, background: "white",
            color: downloaded ? "#86909C" : PRIMARY,
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          {downloaded ? <Check size={14} /> : <Download size={14} />}
          {downloaded ? "已下载" : "下载模板"}
        </button>
      </div>
    </div>
  );
}

/* ── Card 2: 上传文件 ── */
function UploadCard({
  filename, onPick, onUpload, busy, locked, pickerRef,
}: {
  filename: string;
  onPick: (name: string) => void;
  onUpload: () => void;
  busy: boolean;
  locked: boolean;
  pickerRef: React.RefObject<(() => void) | null>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canUpload = !!filename && !busy && !locked;

  function openPicker() {
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  }

  // expose openPicker so the parent can trigger it after reset
  useEffect(() => {
    pickerRef.current = openPicker;
  });


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.xlsx$/i.test(file.name)) {
      alert("仅支持 .xlsx 格式文件，请重新选择");
      e.target.value = "";
      return;
    }
    onPick(file.name);
  }

  return (
    <div style={{ background: "#fff", borderRadius: RADIUS, boxShadow: CARD_SHADOW, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StepBadge n={1} done={locked} />
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1D2129" }}>上传文件</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#86909C", lineHeight: 1.7 }}>
        填写好Excel数据，选择文件上传，分析校验文件
      </p>

      {/* hidden native input, controlled via ref */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* the field itself is clickable too — bigger hit area */}
        <div
          onClick={openPicker}
          style={{
            flex: 1, height: 32,
            border: "1px solid #E5E8EF", borderRadius: RADIUS,
            padding: "0 10px", fontSize: 13,
            color: filename ? "#1D2129" : "#C9CDD4",
            background: "#F7F8FA",
            display: "flex", alignItems: "center", gap: 6,
            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
            cursor: locked ? "not-allowed" : "pointer",
          }}
        >
          {filename && <FileSpreadsheet size={14} color={SUCCESS} style={{ flexShrink: 0 }} />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {filename || "请选择文件"}
          </span>
        </div>
        <button
          type="button"
          onClick={openPicker}
          disabled={locked}
          style={{
            height: 32, padding: "0 14px",
            border: "1px solid #E5E8EF", borderRadius: RADIUS,
            background: locked ? "#F7F8FA" : "#fff",
            color: locked ? "#C9CDD4" : "#4E5969",
            fontSize: 13, fontWeight: 500,
            cursor: locked ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center",
            userSelect: "none", flexShrink: 0,
          }}
        >
          选择
        </button>
      </div>

      <button
        onClick={onUpload}
        disabled={!canUpload}
        style={{
          width: "100%", height: 36,
          background: canUpload ? PRIMARY : "#C2DCFF",
          border: "none", borderRadius: RADIUS,
          color: "white", fontSize: 13, fontWeight: 500,
          cursor: canUpload ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "background 0.15s",
        }}
      >
        {busy
          ? <><Loader2 size={14} className="spin" /> 解析中…</>
          : <><Upload size={14} /> 上传并解析</>}
      </button>
    </div>
  );
}

/* ── Card 3: analysis / import / result ── */
function AnalysisCard({
  phase, progress, importProgress, errorCount, importedCount, onReset,
}: {
  phase: Phase;
  progress: number;
  importProgress: number;
  errorCount: number;
  importedCount: number;
  onReset: () => void;
}) {
  const successCount = TOTAL_ROWS - errorCount;

  return (
    <div
      style={{
        borderRadius: RADIUS, boxShadow: CARD_SHADOW,
        background: phase === "idle"
          ? "linear-gradient(135deg, #D6EAFF 0%, #EAF4FF 60%, #F0F8FF 100%)"
          : "#fff",
        padding: 24, position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", gap: 14,
        minHeight: 196,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StepBadge n={2} done={phase === "imported"} />
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1D2129" }}>数据导入</span>
      </div>

      {/* idle illustration */}
      {phase === "idle" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="120" height="84" viewBox="0 0 240 150" fill="none">
            <circle cx="72" cy="62" r="26" fill="#7BB8F0" />
            <circle cx="72" cy="58" r="19" fill="#9CCBF5" />
            <ellipse cx="65" cy="56" rx="2.5" ry="3" fill="white" />
            <ellipse cx="79" cy="56" rx="2.5" ry="3" fill="white" />
            <path d="M64 65 Q72 71 80 65" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <ellipse cx="72" cy="115" rx="36" ry="20" fill="#7BB8F0" />
            <ellipse cx="72" cy="107" rx="23" ry="18" fill="#9CCBF5" />
            <rect x="118" y="18" width="108" height="104" rx="8" fill="white" />
            <rect x="118" y="18" width="108" height="10" rx="8" fill="#EBF3FF" />
            <circle cx="140" cy="80" r="11" fill="#00B42A" />
            <polyline points="133,80 138,85 148,72" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="180" cy="80" r="11" fill="#FF7D00" />
            <rect x="179" y="72" width="2" height="8" rx="1" fill="white" />
            <circle cx="180" cy="83.5" r="1.4" fill="white" />
          </svg>
          <span style={{ fontSize: 13, color: "#86909C" }}>上传文件后开始数据导入</span>
        </div>
      )}

      {/* analyzing */}
      {phase === "analyzing" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: PRIMARY }}>
            <Loader2 size={16} className="spin" />
            <span style={{ fontSize: 13, fontWeight: 500 }}>正在解析并校验数据…</span>
          </div>
          <div style={{ height: 6, background: "#F2F3F5", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: PRIMARY, borderRadius: 3, transition: "width 0.15s linear" }} />
          </div>
          <span style={{ fontSize: 12, color: "#86909C" }}>已解析 {Math.round(progress)}% · 共 {TOTAL_ROWS} 条记录</span>
        </div>
      )}

      {/* analyzed with ERRORS — requires re-upload, import blocked */}
      {phase === "analyzed" && (
        <>
          <div style={{ display: "flex", gap: 10 }}>
            <Stat label="总数据" value={TOTAL_ROWS} color="#1D2129" />
            <Stat label="校验成功" value={successCount} color={SUCCESS} />
            <Stat label="错误数据" value={errorCount} color={DANGER} />
          </div>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: WARNING, background: "#FFF7E8",
              borderRadius: RADIUS, padding: "7px 10px",
            }}
          >
            <AlertTriangle size={14} /> 存在 {errorCount} 条错误，请修正后重新上传
          </div>
          <button
            onClick={onReset}
            style={{
              height: 34, marginTop: "auto",
              border: "1px solid #E5E8EF", borderRadius: RADIUS,
              background: "#fff", color: "#4E5969",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <RotateCw size={13} /> 重新上传
          </button>
        </>
      )}

      {/* importing — large dataset, show overall progress */}
      {phase === "importing" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: PRIMARY }}>
            <Loader2 size={16} className="spin" />
            <span style={{ fontSize: 13, fontWeight: 500 }}>校验全部通过，正在导入数据…</span>
          </div>
          <div style={{ height: 8, background: "#F2F3F5", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                height: "100%", width: `${importProgress}%`,
                background: `linear-gradient(90deg, ${PRIMARY}, #36BFFA)`,
                borderRadius: 4, transition: "width 0.15s linear",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#86909C" }}>
            <span>已导入 {importedCount} / {successCount} 条</span>
            <span style={{ color: PRIMARY, fontWeight: 600 }}>{Math.round(importProgress)}%</span>
          </div>
        </div>
      )}

      {/* imported — success */}
      {phase === "imported" && (
        <>
          <div style={{ display: "flex", gap: 10 }}>
            <Stat label="总数据" value={TOTAL_ROWS} color="#1D2129" />
            <Stat label="成功导入" value={successCount} color={SUCCESS} />
            <Stat label="错误数据" value={errorCount} color={errorCount ? DANGER : "#C9CDD4"} />
          </div>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: SUCCESS, background: "#E8FFEA",
              borderRadius: RADIUS, padding: "7px 10px",
            }}
          >
            <CheckCircle2 size={14} /> 已成功导入 {successCount} 条电站记录
          </div>
          <button
            onClick={onReset}
            style={{
              height: 34, marginTop: "auto",
              border: "1px solid #E5E8EF", borderRadius: RADIUS,
              background: "#fff", color: "#4E5969",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <RotateCw size={13} /> 继续导入
          </button>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1, background: "#F7F8FA", borderRadius: RADIUS, padding: "10px 12px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#86909C", marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div style={{ padding: "56px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
        <ellipse cx="44" cy="76" rx="28" ry="5" fill="#E5EEFF" />
        <rect x="10" y="36" width="68" height="36" rx="4" fill="#EBF3FF" stroke="#C2D9FF" strokeWidth="1.5" />
        <path d="M10 36 L26 16 H44" stroke="#C2D9FF" strokeWidth="1.5" fill="#DCE8FF" />
        <path d="M78 36 L62 16 H44" stroke="#C2D9FF" strokeWidth="1.5" fill="#DCE8FF" />
        <path d="M32 36 C32 28 56 28 56 36" fill="white" stroke="#C2D9FF" strokeWidth="1.5" />
        <line x1="20" y1="52" x2="36" y2="52" stroke="#C2D9FF" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="61" x2="50" y2="61" stroke="#C2D9FF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="68" cy="22" r="3" fill="#A8CCEE" opacity="0.7" />
        <circle cx="20" cy="28" r="2" fill="#A8CCEE" opacity="0.5" />
        <circle cx="74" cy="40" r="2" fill="#A8CCEE" opacity="0.6" />
      </svg>
      <span style={{ fontSize: 13, color: "#C9CDD4" }}>暂无数据</span>
    </div>
  );
}

/* ── Table ── */
const TABLE_COLS = [
  { key: "no",     label: "序号",     w: 60 },
  { key: "err",    label: "错误信息", w: 130 },
  { key: "name",   label: "电站名称", w: 150 },
  { key: "type",   label: "电站类型", w: 90 },
  { key: "region", label: "所在区域", w: 120 },
  { key: "addr",   label: "详细地址", w: 170 },
  { key: "lng",    label: "经度",     w: 90 },
  { key: "lat",    label: "纬度",     w: 90 },
  { key: "owner",  label: "负责人",   w: 80 },
  { key: "phone",  label: "手机号",   w: 120 },
] as const;

function ImportTable({ rows }: { rows: ErrorRow[] }) {
  return (
    <div style={{ background: "#fff", borderRadius: RADIUS, boxShadow: CARD_SHADOW, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #EEF0F5", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1D2129" }}>导入记录</span>
        <span
          style={{
            fontSize: 12,
            color: rows.length ? DANGER : "#86909C",
            background: rows.length ? "#FFECE8" : "#F2F3F5",
            borderRadius: 10, padding: "1px 8px",
          }}
        >
          {rows.length ? `${rows.length} 条错误` : "0 条"}
        </span>
        {rows.length > 0 && (
          <span style={{ fontSize: 12, color: "#86909C", marginLeft: 4 }}>
            仅展示校验未通过的记录，修正后请重新上传
          </span>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
          <thead>
            <tr style={{ background: "#F7F8FA" }}>
              {TABLE_COLS.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: col.w, minWidth: col.w,
                    padding: "11px 14px", textAlign: "left",
                    fontSize: 13, fontWeight: 500, color: "#86909C",
                    borderBottom: "1px solid #EEF0F5", whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={TABLE_COLS.length}><EmptyState /></td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.no} style={{ borderBottom: "1px solid #F2F3F5" }}>
                  {TABLE_COLS.map((col) => {
                    const val = row[col.key as keyof ErrorRow];
                    const isErr = col.key === "err";
                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: "11px 14px", fontSize: 13,
                          color: isErr ? DANGER : "#4E5969",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isErr ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <AlertTriangle size={12} /> {val}
                          </span>
                        ) : val}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Breadcrumb ── */
function Breadcrumb() {
  const crumbs = ["资产管理", "电站管理", "站点导入"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
      {crumbs.map((c, i) => (
        <span key={c} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              fontSize: 12,
              color: i < crumbs.length - 1 ? "#86909C" : "#C9CDD4",
              cursor: i < crumbs.length - 1 ? "pointer" : "default",
            }}
          >
            {c}
          </span>
          {i < crumbs.length - 1 && <ChevronRight size={12} color="#C9CDD4" />}
        </span>
      ))}
    </div>
  );
}

/* ── Main export ── */
export function SiteImportPage() {
  const [activeTab, setActiveTab] = useState("import");

  // flow state
  const [downloaded, setDownloaded] = useState(false);
  const [filename, setFilename] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);            // analysis/validation progress
  const [importProgress, setImportProgress] = useState(0); // import progress
  const [errorRows, setErrorRows] = useState<ErrorRow[]>([]);
  const [attempt, setAttempt] = useState(0); // first try → has errors, retry → clean
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pickerRef = useRef<(() => void) | null>(null);

  const successCount = TOTAL_ROWS - errorRows.length;
  const importedCount = Math.round((importProgress / 100) * successCount);

  // ── stepper state, derived per phase (download is optional, not a step) ──
  // idle      → ① 上传文件 in focus
  // analyzing → ② 数据校验 in progress
  // analyzed  → ② 数据校验 failed (errors) — needs attention
  // importing → ③ 确认导入 in progress
  // imported  → ③ 确认导入 done (all green)
  const hasErrors = errorRows.length > 0;
  const currentStep =
    phase === "importing" || phase === "imported" ? 3
    : phase === "analyzing" || phase === "analyzed" ? 2
    : 1;
  const currentDone = phase === "imported";
  const stepError = phase === "analyzed" && hasErrors;

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  // ── Step ②: parse + validate the uploaded file ──
  function startUpload() {
    setPhase("analyzing");
    setProgress(0);
    setErrorRows([]);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12 + 6;
        if (next >= 100) {
          if (timer.current) clearInterval(timer.current);
          // first attempt yields errors, subsequent attempts are clean
          const errs = attempt === 0 ? MOCK_ERRORS : [];
          setErrorRows(errs);
          if (errs.length === 0) {
            // all checks passed → go straight to importing
            startImport();
          } else {
            setPhase("analyzed");
          }
          return 100;
        }
        return next;
      });
    }, 160);
  }

  // ── Step ③: import the validated data (large dataset → show progress) ──
  function startImport() {
    setPhase("importing");
    setImportProgress(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setImportProgress((p) => {
        const next = p + Math.random() * 7 + 3; // slower — large dataset
        if (next >= 100) {
          if (timer.current) clearInterval(timer.current);
          setPhase("imported");
          return 100;
        }
        return next;
      });
    }, 180);
  }

  function resetUpload() {
    if (timer.current) clearInterval(timer.current);
    setAttempt((a) => a + 1);
    setFilename("");
    setProgress(0);
    setImportProgress(0);
    setErrorRows([]);
    setPhase("idle");
    // immediately open the file picker so the user can re-select without an extra click
    setTimeout(() => pickerRef.current?.(), 0);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @keyframes tm-spin { to { transform: rotate(360deg); } }
        .spin { animation: tm-spin 0.9s linear infinite; }
      `}</style>

      <TabBar active={activeTab} onChange={setActiveTab} />

      <div style={{ flex: 1, overflowY: "auto", background: "#F5F6FA", padding: "24px 28px" }}>
        <Breadcrumb />
        <h1 style={{ margin: "0 0 22px", fontSize: 20, fontWeight: 700, color: "#1D2129", lineHeight: 1 }}>
          站点导入
        </h1>

        {/* Step indicator */}
        <Stepper current={currentStep} currentDone={currentDone} error={stepError} />

        {/* Three step cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <DownloadCard downloaded={downloaded} onDownload={() => setDownloaded(true)} />
          <UploadCard
            filename={filename}
            onPick={setFilename}
            onUpload={startUpload}
            busy={phase === "analyzing"}
            locked={phase === "analyzed" || phase === "importing" || phase === "imported"}
            pickerRef={pickerRef}
          />
          <AnalysisCard
            phase={phase}
            progress={progress}
            importProgress={importProgress}
            errorCount={errorRows.length}
            importedCount={importedCount}
            onReset={resetUpload}
          />
        </div>

        {/* Import records table */}
        <ImportTable rows={errorRows} />
      </div>
    </div>
  );
}
