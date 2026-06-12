/**
 * Utility functions for date and time operations
 * Used throughout the dashboard for formatting and calculations
 */

/**
 * Format a local Date object to YYYY-MM-DD without UTC conversion.
 * Avoids timezone shift bugs from toISOString() when local time is ahead of UTC.
 */
export const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Get the first and last day of the current month as YYYY-MM-DD strings.
 * Uses local year/month to avoid timezone-induced date shifting.
 */
export const getMonthBounds = () => {
  const now = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based
  return {
    first: `${year}-${String(month).padStart(2, "0")}-01`,
    // Day 0 of next month = last day of current month (handles 28/29/30/31 correctly)
    last: toDateStr(new Date(year, month, 0)),
  };
};

/**
 * Build first/last day strings for any given month + year.
 * Handles leap years and all month lengths correctly.
 */
export const getMonthRange = (month, year) => ({
  firstDay: `${year}-${String(month).padStart(2, "0")}-01`,
  lastDay:  toDateStr(new Date(year, month, 0)),
});

/**
 * Convert date to readable time format (HH:MM)
 */
export const formatTime = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/**
 * Calculate total break time in minutes from array of breaks
 */
export const calculateBreakMinutes = (breaks = []) =>
  breaks.reduce((acc, b) => {
    if (b.breakIn && b.breakOut)
      acc += (new Date(b.breakOut) - new Date(b.breakIn)) / 60000;
    return acc;
  }, 0);

/**
 * Convert minutes to HH:MM format
 */
export const minutesToHM = (minutes) =>
  `${Math.floor(minutes / 60)}:${String(Math.floor(minutes % 60)).padStart(2, "0")}`;

/**
 * Convert minutes to human-readable format (Xh Ym)
 */
export const minutesToHMs = (minutes) =>
  `${Math.floor(minutes / 60)}h ${Math.floor(minutes % 60)}m`;

/**
 * Calculate net working hours from check-in/out with breaks deducted
 */
export const calculateWorkingHours = (record) => {
  if (!record.checkIn || !record.checkOut) return "—";

  const totalMs = new Date(record.checkOut) - new Date(record.checkIn);
  const breakMins = calculateBreakMinutes(record.breaks);
  const netMins = totalMs / 60000 - breakMins;

  return minutesToHMs(netMins);
};

/**
 * Count approved leave days in a date range
 */
export const countLeaveDays = (leaves, startDate, endDate) =>
  leaves
    .filter(
      (leave) =>
        leave.status === "APPROVED" &&
        new Date(leave.fromDate) <= endDate &&
        new Date(leave.toDate) >= startDate,
    )
    .reduce((acc, leave) => {
      const s =
        new Date(leave.fromDate) < startDate
          ? startDate
          : new Date(leave.fromDate);
      const e =
        new Date(leave.toDate) > endDate ? endDate : new Date(leave.toDate);
      const daysDiff = Math.ceil((e - s) / 86400000) + 1;
      return acc + (leave.isHalfDay ? 0.5 : daysDiff);
    }, 0);

/**
 * Format current date as readable string
 */
export const formatCurrentDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * Get today's date in YYYY-MM-DD format using IST timezone (Asia/Kolkata).
 * Avoids the UTC midnight shift — e.g. 00:30 IST would return yesterday in UTC.
 */
export const getTodayDate = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
