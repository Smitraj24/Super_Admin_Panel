// ─── Shared constants & helpers for SuperAdmin dashboard

export const COLORS = ["#10b981", "#f59e0b", "#8b5cf6", "#3b82f6"];

export const STATUS_PRESENT = new Set([
  "CHECKED_IN",
  "LATE",
  "ON_BREAK",
  "BACK_TO_WORK",
]);

export const RATE_COLOR = (r) =>
  r >= 90
    ? "bg-green-100 text-green-700"
    : r >= 80
      ? "bg-blue-100 text-blue-700"
      : r >= 70
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

export const LEAVE_COLOR = (s) =>
  s === "APPROVED"
    ? "bg-green-100 text-green-700"
    : s === "PENDING"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

export const todayStr = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export const monthRange = () => {
  const now = new Date();
  // Use IST date parts to avoid UTC midnight shift
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const year  = parseInt(parts.find((p) => p.type === "year").value);
  const month = parseInt(parts.find((p) => p.type === "month").value);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    first: `${year}-${String(month).padStart(2, "0")}-01`,
    last:  `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
};

export const isPresent = (r) => STATUS_PRESENT.has(r.status) || r.checkIn;

export const getTimeAgo = (timestamp) => {
  const s = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const safeArray = (val) =>
  Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];

export const shiftFor = (checkIn) => {
  const h = checkIn ? new Date(checkIn).getHours() : 9;
  if (h >= 6 && h < 14) return "morning";
  if (h >= 14 && h < 22) return "evening";
  if (h >= 22 || h < 6) return "night";
  return "flexible";
};

export const pct = (num, total) =>
  total > 0 ? ((num / total) * 100).toFixed(1) : "0.0";
