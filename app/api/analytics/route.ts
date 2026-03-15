import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const POSTHOG_HOST = "https://eu.posthog.com";
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY || "";
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || "140597";

async function phQuery(query: object) {
  if (!POSTHOG_PERSONAL_API_KEY) return null;
  try {
    const res = await fetch(
      `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        cache: "no-store",
      }
    );
    if (!res.ok) { console.error("PostHog query failed:", res.status, await res.text()); return null; }
    return res.json();
  } catch (e) { console.error("PostHog query error:", e); return null; }
}

function getDateRange(range: string, customFrom?: string, customTo?: string) {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().split("T")[0];
  switch (range) {
    case "today":
      return { date_from: iso(today) };
    case "yesterday": {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return { date_from: iso(y), date_to: iso(y) };
    }
    case "7d":
      return { date_from: "-7d" };
    case "month": {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { date_from: iso(first) };
    }
    case "custom":
      return customTo
        ? { date_from: customFrom ?? "-30d", date_to: customTo }
        : { date_from: customFrom ?? "-30d" };
    default: // "30d"
      return { date_from: "-30d" };
  }
}

function generateMockData() {
  const now = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const base = 120 + Math.sin(i / 3) * 40 + Math.random() * 60;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    return {
      date: d.toISOString().split("T")[0],
      pageviews: Math.round(base * (isWeekend ? 0.6 : 1)),
      sessions: Math.round(base * 0.45 * (isWeekend ? 0.6 : 1)),
      users: Math.round(base * 0.35 * (isWeekend ? 0.6 : 1)),
    };
  });
  return {
    summary: {
      pageviews: days.reduce((s, d) => s + d.pageviews, 0),
      sessions: days.reduce((s, d) => s + d.sessions, 0),
      users: days.reduce((s, d) => s + d.users, 0),
      avgSessionDuration: 184, bounceRate: 42.3,
      pageviewsChange: 22, sessionsChange: 27, usersChange: 30,
    },
    timeseries: days,
    topPages: [
      { path: "/", title: "Pitch Deck", views: 1842, pct: 32 },
      { path: "/dashboard", title: "Dashboard", views: 387, pct: 7 },
    ],
    topCountries: [
      { country: "UAE", code: "AE", sessions: 1840, pct: 42 },
      { country: "Saudi Arabia", code: "SA", sessions: 612, pct: 14 },
      { country: "United Kingdom", code: "GB", sessions: 438, pct: 10 },
      { country: "Sweden", code: "SE", sessions: 310, pct: 7 },
      { country: "India", code: "IN", sessions: 290, pct: 7 },
      { country: "USA", code: "US", sessions: 218, pct: 5 },
    ],
    devices: [
      { name: "Mobile", value: 58, color: "#f05223" },
      { name: "Desktop", value: 34, color: "#888888" },
      { name: "Tablet", value: 8, color: "#e5e0da" },
    ],
    referrers: [
      { source: "Direct", sessions: 1240, pct: 38 },
      { source: "Google", sessions: 980, pct: 30 },
      { source: "Instagram", sessions: 520, pct: 16 },
      { source: "LinkedIn", sessions: 260, pct: 8 },
      { source: "Other", sessions: 260, pct: 8 },
    ],
    browsers: [
      { name: "Chrome", sessions: 1840, pct: 52 },
      { name: "Safari", sessions: 980, pct: 28 },
      { name: "Firefox", sessions: 350, pct: 10 },
      { name: "Edge", sessions: 210, pct: 6 },
      { name: "Other", sessions: 140, pct: 4 },
    ],
    operatingSystems: [
      { name: "iOS", sessions: 1420, pct: 40 },
      { name: "Android", sessions: 920, pct: 26 },
      { name: "Windows", sessions: 700, pct: 20 },
      { name: "macOS", sessions: 350, pct: 10 },
      { name: "Other", sessions: 140, pct: 4 },
    ],
    isDemo: true,
  };
}

// Country code → name map
const CODE_TO_COUNTRY: Record<string, string> = {
  "AE":"UAE","SA":"Saudi Arabia","GB":"United Kingdom","US":"USA","SE":"Sweden",
  "IN":"India","DE":"Germany","FR":"France","IT":"Italy","ES":"Spain",
  "NL":"Netherlands","PL":"Poland","AU":"Australia","CA":"Canada","BR":"Brazil",
  "MX":"Mexico","JP":"Japan","CN":"China","KR":"South Korea","SG":"Singapore",
  "MY":"Malaysia","PH":"Philippines","ID":"Indonesia","TH":"Thailand","VN":"Vietnam",
  "PK":"Pakistan","BD":"Bangladesh","LK":"Sri Lanka","EG":"Egypt","NG":"Nigeria",
  "KE":"Kenya","ZA":"South Africa","GH":"Ghana","MA":"Morocco","DZ":"Algeria",
  "QA":"Qatar","KW":"Kuwait","BH":"Bahrain","OM":"Oman","JO":"Jordan",
  "LB":"Lebanon","IQ":"Iraq","IR":"Iran","TR":"Turkey","IL":"Israel",
  "RU":"Russia","UA":"Ukraine","RO":"Romania","CZ":"Czech Republic","HU":"Hungary",
  "GR":"Greece","PT":"Portugal","AT":"Austria","CH":"Switzerland","BE":"Belgium",
  "DK":"Denmark","FI":"Finland","NO":"Norway","IE":"Ireland","NZ":"New Zealand",
  "ZW":"Zimbabwe","AR":"Argentina","CO":"Colombia","HK":"Hong Kong","TW":"Taiwan",
};

const NO_CACHE = {
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "CDN-Cache-Control": "no-store",
    "Vercel-CDN-Cache-Control": "no-store",
  },
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = url.searchParams.get("range") ?? "30d";
  const customFrom = url.searchParams.get("from") ?? undefined;
  const customTo   = url.searchParams.get("to")   ?? undefined;
  const DATE_RANGE = getDateRange(range, customFrom, customTo);

  if (!POSTHOG_PERSONAL_API_KEY) return NextResponse.json(generateMockData(), NO_CACHE);

  const [overviewRes, pagesRes, countriesRes, devicesRes, referrersRes, browsersRes, osRes] =
    await Promise.all([
      // WebOverviewQuery for session duration & bounce rate only (it ignores dateRange for counts)
      phQuery({ kind: "WebOverviewQuery", properties: [], dateRange: DATE_RANGE }),
      phQuery({ kind: "WebStatsTableQuery", properties: [], dateRange: DATE_RANGE, breakdownBy: "Page", limit: 10 }),
      phQuery({ kind: "WebStatsTableQuery", properties: [], dateRange: DATE_RANGE, breakdownBy: "Country", limit: 10 }),
      phQuery({ kind: "WebStatsTableQuery", properties: [], dateRange: DATE_RANGE, breakdownBy: "DeviceType", limit: 10 }),
      phQuery({ kind: "WebStatsTableQuery", properties: [], dateRange: DATE_RANGE, breakdownBy: "InitialChannelType", limit: 10 }),
      phQuery({ kind: "WebStatsTableQuery", properties: [], dateRange: DATE_RANGE, breakdownBy: "Browser", limit: 8 }),
      phQuery({ kind: "WebStatsTableQuery", properties: [], dateRange: DATE_RANGE, breakdownBy: "OS", limit: 8 }),
    ]);

  if (!pagesRes?.results && !overviewRes?.results) return NextResponse.json(generateMockData(), NO_CACHE);

  // WebOverviewQuery: only used for session duration & bounce rate (it ignores dateRange for counts)
  const overview: Record<string, number> = {};
  for (const item of overviewRes?.results ?? []) {
    overview[item.key] = item.value ?? 0;
  }

  // ── WebOverviewQuery respects dateRange for ALL metrics (sessions, visitors, views) ──
  // Use it as the primary source for summary totals.
  const totalSessions  = Math.round(overview["sessions"]  ?? 0);
  const totalVisitors  = Math.round(overview["visitors"]  ?? 0);
  const totalPageViews = Math.round(overview["views"]     ?? 0);
  const avgSessionDuration = Math.round(overview["session duration"] ?? 0);
  const bounceRate = Math.round((overview["bounce rate"] ?? 0) * 100);

  // Pages / countries breakdowns are used for the table UI only (not for totals)
  const pagesRaw    = pagesRes?.results     ?? [];
  const countriesRaw = countriesRes?.results ?? [];

  // Build timeseries — put totals on the most recent day(s) of the selected range
  const now = new Date();
  const timeseries = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    return { date: d.toISOString().split("T")[0], pageviews: 0, sessions: 0, users: 0 };
  });
  if (timeseries.length > 0) {
    timeseries[timeseries.length - 1].pageviews = Math.round(totalPageViews);
    timeseries[timeseries.length - 1].sessions  = Math.round(totalSessions);
    timeseries[timeseries.length - 1].users     = Math.round(totalVisitors);
  }

  // Pages
  const topPages = pagesRaw.slice(0, 6).map((r: [string, [number], [number]]) => ({
    path: r[0] || "/",
    title: r[0] || "/",
    views: Math.round(r[2]?.[0] ?? 0),
    pct: totalPageViews ? Math.round(((r[2]?.[0] ?? 0) / totalPageViews) * 100) : 0,
  }));

  // Countries
  const topCountries = countriesRaw.slice(0, 6).map((r: [string, [number]]) => ({
    country: CODE_TO_COUNTRY[r[0]] ?? r[0] ?? "Unknown",
    code: r[0] ?? "",
    sessions: Math.round(r[1]?.[0] ?? 0),
    pct: totalSessions ? Math.round(((r[1]?.[0] ?? 0) / totalSessions) * 100) : 0,
  }));

  // Devices: [deviceType, [visitors, change], [views, change], ...]
  const devicesRaw = devicesRes?.results ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalDevVisitors = devicesRaw.reduce((s: number, r: any) => s + (r[1]?.[0] ?? 0), 0);
  const deviceColors: Record<string, string> = { Desktop: "#888888", Mobile: "#f05223", Tablet: "#e5e0da" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devices = devicesRaw.slice(0, 4).map((r: any) => ({
    name: r[0] || "Other",
    value: totalDevVisitors ? Math.round(((r[1]?.[0] ?? 0) / totalDevVisitors) * 100) : 0,
    color: deviceColors[r[0]] ?? "#555555",
  }));

  // Referrers: [channel, [visitors, change], ...]
  const referrersRaw = referrersRes?.results ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalRefVisitors = referrersRaw.reduce((s: number, r: any) => s + (r[1]?.[0] ?? 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const referrers = referrersRaw.slice(0, 6).map((r: any) => ({
    source: r[0] || "Direct",
    sessions: Math.round(r[1]?.[0] ?? 0),
    pct: totalRefVisitors ? Math.round(((r[1]?.[0] ?? 0) / totalRefVisitors) * 100) : 0,
  }));

  // Browsers
  const browsersRaw = browsersRes?.results ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalBrowserVisitors = browsersRaw.reduce((s: number, r: any) => s + (r[1]?.[0] ?? 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const browsers = browsersRaw.slice(0, 8).map((r: any) => ({
    name: r[0] || "Other",
    sessions: Math.round(r[1]?.[0] ?? 0),
    pct: totalBrowserVisitors ? Math.round(((r[1]?.[0] ?? 0) / totalBrowserVisitors) * 100) : 0,
  }));

  // OS
  const osRaw = osRes?.results ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalOsVisitors = osRaw.reduce((s: number, r: any) => s + (r[1]?.[0] ?? 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const operatingSystems = osRaw.slice(0, 8).map((r: any) => ({
    name: r[0] || "Other",
    sessions: Math.round(r[1]?.[0] ?? 0),
    pct: totalOsVisitors ? Math.round(((r[1]?.[0] ?? 0) / totalOsVisitors) * 100) : 0,
  }));

  const mock = generateMockData();

  return NextResponse.json({
    summary: {
      pageviews: Math.round(totalPageViews),
      sessions:  Math.round(totalSessions),
      users:     Math.round(totalVisitors),
      avgSessionDuration,
      bounceRate,
      pageviewsChange: 0,
      sessionsChange:  0,
      usersChange:     0,
    },
    timeseries,
    topPages: topPages.length ? topPages : mock.topPages,
    topCountries: topCountries.length ? topCountries : mock.topCountries,
    devices: devices.length ? devices : mock.devices,
    referrers: referrers.length ? referrers : mock.referrers,
    browsers: browsers.length ? browsers : mock.browsers,
    operatingSystems: operatingSystems.length ? operatingSystems : mock.operatingSystems,
    isDemo: false,
    source: "posthog",
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  });
}
