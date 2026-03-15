"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  RefreshCw, ExternalLink, Users, MousePointer,
  Monitor, Smartphone, Tablet, Globe, Calendar,
  ChevronLeft, ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BreakdownItem { name: string; sessions: number; pct: number }

interface AnalyticsData {
  summary: {
    pageviews: number; sessions: number; users: number;
    avgSessionDuration: number; bounceRate: number;
    pageviewsChange: number; sessionsChange: number; usersChange: number;
  };
  timeseries: Array<{ date: string; pageviews: number; sessions: number; users: number }>;
  topPages: Array<{ path: string; title: string; views: number; pct: number }>;
  topCountries: Array<{ country: string; code: string; sessions: number; pct: number }>;
  devices: Array<{ name: string; value: number; color: string }>;
  referrers: Array<{ source: string; sessions: number; pct: number }>;
  browsers: BreakdownItem[];
  operatingSystems: BreakdownItem[];
  isDemo: boolean;
}

// ─── Date range types ─────────────────────────────────────────────────────────

type RangePreset = "today" | "yesterday" | "7d" | "30d" | "month" | "custom";

interface DateRange {
  preset: RangePreset;
  customFrom?: string; // ISO date yyyy-mm-dd
  customTo?: string;
}

const PRESET_LABELS: Record<RangePreset, string> = {
  today:     "Today",
  yesterday: "Yesterday",
  "7d":      "Last 7 days",
  "30d":     "Last 30 days",
  month:     "This month",
  custom:    "Custom range",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}
function fmtDur(s: number) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}
function countryFlag(code: string) {
  const f: Record<string, string> = {
    AE:"\u{1F1E6}\u{1F1EA}",SA:"\u{1F1F8}\u{1F1E6}",GB:"\u{1F1EC}\u{1F1E7}",
    SE:"\u{1F1F8}\u{1F1EA}",IN:"\u{1F1EE}\u{1F1F3}",US:"\u{1F1FA}\u{1F1F8}",
    DE:"\u{1F1E9}\u{1F1EA}",FR:"\u{1F1EB}\u{1F1F7}",AU:"\u{1F1E6}\u{1F1FA}",
    CA:"\u{1F1E8}\u{1F1E6}",PK:"\u{1F1F5}\u{1F1F0}",SG:"\u{1F1F8}\u{1F1EC}",
    MY:"\u{1F1F2}\u{1F1FE}",QA:"\u{1F1F6}\u{1F1E6}",KW:"\u{1F1F0}\u{1F1FC}",
    BH:"\u{1F1E7}\u{1F1ED}",OM:"\u{1F1F4}\u{1F1F2}",JO:"\u{1F1EF}\u{1F1F4}",
    EG:"\u{1F1EA}\u{1F1EC}",NG:"\u{1F1F3}\u{1F1EC}",KE:"\u{1F1F0}\u{1F1EA}",
    ZA:"\u{1F1FF}\u{1F1E6}",PH:"\u{1F1F5}\u{1F1ED}",ID:"\u{1F1EE}\u{1F1E9}",
    TR:"\u{1F1F9}\u{1F1F7}",
  };
  return f[code] ?? "\u{1F30D}";
}

// ─── Mini calendar ────────────────────────────────────────────────────────────

function MiniCalendar({
  value, onChange,
}: {
  value: string;
  onChange: (d: string) => void;
}) {
  const [view, setView] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const { year, month } = view;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  const monthName = new Date(year, month).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const prev = () => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const next = () => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  const toISO = (day: number) => isoDate(new Date(year, month, day));

  return (
    <div className="w-64">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-1 rounded hover:bg-gray-100"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
        <span className="text-xs font-semibold text-gray-700">{monthName}</span>
        <button onClick={next} className="p-1 rounded hover:bg-gray-100"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <span key={d} className="text-center text-xs text-gray-400 py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => day === null ? (
          <span key={`e${i}`} />
        ) : (
          <button
            key={day}
            onClick={() => onChange(toISO(day))}
            className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs transition-colors ${
              value === toISO(day)
                ? "bg-[#f05223] text-white font-bold"
                : "hover:bg-orange-50 text-gray-700"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Date filter dropdown ─────────────────────────────────────────────────────

function DateFilter({
  range, onChange,
}: {
  range: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(range.customFrom ?? isoDate(new Date()));
  const [customTo,   setCustomTo]   = useState(range.customTo   ?? isoDate(new Date()));
  const [showFrom, setShowFrom] = useState(false);
  const [showTo,   setShowTo]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setShowFrom(false); setShowTo(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const label = range.preset === "custom"
    ? `${range.customFrom} → ${range.customTo}`
    : PRESET_LABELS[range.preset];

  const presets: RangePreset[] = ["today", "yesterday", "7d", "30d", "month", "custom"];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 hover:border-orange-300 px-3 py-2 rounded-xl transition-colors font-medium shadow-sm"
      >
        <Calendar className="w-4 h-4 text-[#f05223]" />
        {label}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[200px]">
          <div className="p-1">
            {presets.filter(p => p !== "custom").map(p => (
              <button
                key={p}
                onClick={() => { onChange({ preset: p }); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  range.preset === p
                    ? "bg-orange-50 text-[#f05223] font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {PRESET_LABELS[p]}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="border-t border-gray-100 p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Custom range</p>
            <div className="flex flex-col gap-2">
              {/* From */}
              <div>
                <label className="text-xs text-gray-400 mb-0.5 block">From</label>
                <button
                  onClick={() => { setShowFrom(f => !f); setShowTo(false); }}
                  className={`w-full text-left text-sm border rounded-lg px-3 py-1.5 transition-colors ${showFrom ? "border-[#f05223] text-[#f05223]" : "border-gray-200 text-gray-700 hover:border-orange-200"}`}
                >
                  {customFrom || "Pick date"}
                </button>
                {showFrom && (
                  <div className="mt-1 p-2 border border-gray-200 rounded-xl bg-white shadow-lg">
                    <MiniCalendar value={customFrom} onChange={d => { setCustomFrom(d); setShowFrom(false); }} />
                  </div>
                )}
              </div>
              {/* To */}
              <div>
                <label className="text-xs text-gray-400 mb-0.5 block">To</label>
                <button
                  onClick={() => { setShowTo(t => !t); setShowFrom(false); }}
                  className={`w-full text-left text-sm border rounded-lg px-3 py-1.5 transition-colors ${showTo ? "border-[#f05223] text-[#f05223]" : "border-gray-200 text-gray-700 hover:border-orange-200"}`}
                >
                  {customTo || "Pick date"}
                </button>
                {showTo && (
                  <div className="mt-1 p-2 border border-gray-200 rounded-xl bg-white shadow-lg">
                    <MiniCalendar value={customTo} onChange={d => { setCustomTo(d); setShowTo(false); }} />
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  onChange({ preset: "custom", customFrom, customTo });
                  setOpen(false);
                }}
                className="w-full bg-[#f05223] hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors mt-1"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((e) => (
        <div key={e.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
          <span className="text-gray-500 capitalize">{e.name}:</span>
          <span className="font-bold text-gray-800">{fmt(e.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, icon: Icon, active, onClick,
}: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-xl border transition-all duration-150 ${
        active
          ? "bg-white border-[#f05223] shadow-md shadow-orange-100"
          : "bg-white border-gray-200 hover:border-orange-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wide ${active ? "text-[#f05223]" : "text-gray-400"}`}>
          {label}
        </span>
        <Icon className={`w-4 h-4 ${active ? "text-[#f05223]" : "text-gray-300"}`} />
      </div>
      <div className={`text-3xl font-bold mb-1 ${active ? "text-[#f05223]" : "text-gray-800"}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
      {active && <div className="mt-2 h-0.5 bg-[#f05223] rounded-full w-8" />}
    </button>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function TableRow({
  rank, label, value, pct, prefix,
}: {
  rank: number; label: string; value: number; pct: number; prefix?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-orange-50/30 -mx-2 px-2 rounded-lg transition-colors">
      <span className="text-xs text-gray-300 w-4 font-mono shrink-0">{rank}</span>
      {prefix != null && <span className="text-base shrink-0">{prefix}</span>}
      <span className="text-sm text-gray-700 flex-1 truncate font-medium">{label}</span>
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#f05223] rounded-full opacity-60" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <span className="text-sm font-semibold text-gray-800 w-10 text-right">{fmt(value)}</span>
        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skel({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"sessions" | "pageviews" | "users">("sessions");
  const [breakdownTab, setBreakdownTab] = useState<"countries" | "pages" | "sources">("countries");
  const [clarityTab, setClarityTab] = useState<"browser" | "os" | "device" | "region">("browser");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ preset: "30d" });

  // Keep a ref so the interval always reads the latest range without stale closures
  const dateRangeRef = useRef<DateRange>({ preset: "30d" });

  const buildApiUrl = (r: DateRange) => {
    const params = new URLSearchParams({ t: Date.now().toString(), range: r.preset });
    if (r.preset === "custom") {
      if (r.customFrom) params.set("from", r.customFrom);
      if (r.customTo)   params.set("to",   r.customTo);
    }
    return `/api/analytics?${params}`;
  };

  const fetchData = async (r?: DateRange) => {
    const range = r ?? dateRangeRef.current;
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl(range), { cache: "no-store" });
      setData(await res.json());
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (r: DateRange) => {
    dateRangeRef.current = r;   // update ref FIRST so interval picks it up too
    setDateRange(r);
    fetchData(r);
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(), 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deviceIcon = (name: string) => {
    if (name === "Mobile")  return <Smartphone className="w-3.5 h-3.5 text-gray-400" />;
    if (name === "Tablet")  return <Tablet className="w-3.5 h-3.5 text-gray-400" />;
    return <Monitor className="w-3.5 h-3.5 text-gray-400" />;
  };

  // Build Clarity-tab rows from data
  const clarityRows = (() => {
    if (!data) return [];
    switch (clarityTab) {
      case "browser": return (data.browsers ?? []).map(b => ({ label: b.name, value: b.sessions, pct: b.pct }));
      case "os":      return (data.operatingSystems ?? []).map(o => ({ label: o.name, value: o.sessions, pct: o.pct }));
      case "device":  return data.devices.map(d => ({ label: d.name, value: d.value, pct: d.value }));
      case "region":  return data.topCountries.map(c => ({ label: c.country, value: c.sessions, pct: c.pct, code: c.code }));
      default: return [];
    }
  })();

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans">
      <main className="max-w-screen-xl mx-auto px-6 py-7">

        {/* ─── Page header ─── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-[#f05223]">Scalify</span> Analytics
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">scalifypitchdeck.vercel.app</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Live dot */}
            <span className="flex items-center gap-1.5 text-xs text-gray-400 mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Live"}
              {data?.isDemo && (
                <span className="ml-1 bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Demo</span>
              )}
            </span>

            {/* Date filter */}
            <DateFilter range={dateRange} onChange={handleRangeChange} />

            {/* Refresh */}
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-colors text-gray-500 disabled:opacity-40"
              title="Refresh now"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#f05223]" : ""}`} />
            </button>

            {/* Pitch deck link */}
            <a
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 hover:border-orange-200 px-3 py-2 rounded-xl transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Pitch Deck
            </a>

            {/* Open Clarity */}
            <a
              href="https://clarity.microsoft.com/projects/view/vv35sn59q2/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-white bg-[#f05223] hover:bg-orange-600 px-3 py-2 rounded-xl transition-colors font-semibold shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Clarity
            </a>
          </div>
        </div>

        {/* ─── 4 metric cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? (
            Array(4).fill(null).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <Skel className="w-24 h-3" />
                <Skel className="w-16 h-8" />
                <Skel className="w-28 h-3" />
              </div>
            ))
          ) : data ? (
            <>
              <MetricCard label="Sessions"      value={fmt(data.summary.sessions)}   sub="total visits"      icon={MousePointer} active={metric==="sessions"}  onClick={() => setMetric("sessions")} />
              <MetricCard label="Page Views"    value={fmt(data.summary.pageviews)}  sub="total page loads"  icon={Globe}        active={metric==="pageviews"} onClick={() => setMetric("pageviews")} />
              <MetricCard label="Visitors"      value={fmt(data.summary.users)}      sub="unique users"      icon={Users}        active={metric==="users"}     onClick={() => setMetric("users")} />
              <MetricCard label="Avg. Active Time" value={fmtDur(data.summary.avgSessionDuration)}
                sub={data.summary.bounceRate > 0 ? `Bounce rate ${data.summary.bounceRate}%` : "per session"}
                icon={Monitor} />
            </>
          ) : null}
        </div>

        {/* ─── Area chart ─── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">
              {metric === "pageviews" ? "Page Views" : metric === "sessions" ? "Sessions" : "Visitors"} over time
            </h2>
            <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
              {(["sessions","pageviews","users"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    metric === m ? "bg-white text-[#f05223] shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m === "pageviews" ? "Views" : m === "users" ? "Visitors" : "Sessions"}
                </button>
              ))}
            </div>
          </div>
          {loading ? <Skel className="h-56 w-full" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.timeseries}>
                <defs>
                  <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f05223" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f05223" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey={metric} stroke="#f05223" strokeWidth={2}
                  fill="url(#orangeGrad)" dot={false}
                  activeDot={{ r:4, fill:"#f05223", stroke:"#fff", strokeWidth:2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ─── Two-column bottom section ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2/3 — Countries / Pages / Sources */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex border-b border-gray-100 mb-1">
              {([
                { id:"countries" as const, label:"Countries" },
                { id:"pages"     as const, label:"Pages" },
                { id:"sources"   as const, label:"Traffic Sources" },
              ]).map(t => (
                <button key={t.id} onClick={() => setBreakdownTab(t.id)}
                  className={`mr-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    breakdownTab === t.id
                      ? "border-[#f05223] text-[#f05223]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div className="flex items-center gap-3 px-2 py-2 mb-1">
              <span className="w-4 shrink-0" />
              <span className="text-xs text-gray-400 flex-1">
                {breakdownTab === "countries" ? "Country" : breakdownTab === "pages" ? "Path" : "Source"}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="w-20 text-xs text-gray-400 text-center">Share</span>
                <span className="w-10 text-xs text-gray-400 text-right">{breakdownTab === "pages" ? "Views" : "Sessions"}</span>
                <span className="w-8  text-xs text-gray-400 text-right">%</span>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">{Array(5).fill(null).map((_,i) => <Skel key={i} className="h-9 w-full" />)}</div>
            ) : (
              <>
                {breakdownTab === "countries" && data?.topCountries.map((c,i) => (
                  <TableRow key={c.country} rank={i+1} label={c.country} value={c.sessions} pct={c.pct} prefix={countryFlag(c.code)} />
                ))}
                {breakdownTab === "pages" && data?.topPages.map((p,i) => (
                  <TableRow key={p.path} rank={i+1} label={p.path} value={p.views} pct={p.pct} />
                ))}
                {breakdownTab === "sources" && data?.referrers.map((r,i) => (
                  <TableRow key={r.source} rank={i+1} label={r.source} value={r.sessions} pct={r.pct} />
                ))}
              </>
            )}
          </div>

          {/* Right 1/3 — Last 7 days bar chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-800 text-sm mb-4">Last 7 days</h2>
            {loading ? <Skel className="h-40 w-full" /> : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data?.timeseries.slice(-7)} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pageviews" fill="#f05223" radius={[3,3,0,0]} name="views" opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ─── Clarity-style: Browser / OS / Device / Region ─── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-800">Audience breakdown</h2>
          </div>

          {/* Tab strip */}
          <div className="flex border-b border-gray-100 mb-4">
            {([
              { id:"browser" as const, label:"Browser" },
              { id:"os"      as const, label:"OS" },
              { id:"device"  as const, label:"Device" },
              { id:"region"  as const, label:"Region" },
            ]).map(t => (
              <button key={t.id} onClick={() => setClarityTab(t.id)}
                className={`mr-1 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  clarityTab === t.id
                    ? "border-[#f05223] text-[#f05223]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array(6).fill(null).map((_,i) => <Skel key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
              {clarityRows.map((row, i) => (
                <div key={row.label} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  {/* rank */}
                  <span className="text-xs text-gray-300 w-4 font-mono shrink-0">{i + 1}</span>
                  {/* flag for region tab */}
                  {"code" in row && (
                    <span className="text-base shrink-0">{countryFlag((row as {code:string}).code)}</span>
                  )}
                  {/* device icon for device tab */}
                  {clarityTab === "device" && (
                    <span className="shrink-0">{deviceIcon(row.label)}</span>
                  )}
                  <span className="text-sm text-gray-700 flex-1 truncate font-medium">{row.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#f05223] rounded-full opacity-60" style={{ width:`${Math.min(row.pct,100)}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{row.pct}%</span>
                  </div>
                </div>
              ))}
              {clarityRows.length === 0 && (
                <p className="text-sm text-gray-400 col-span-3 py-4">No data for this period yet.</p>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
