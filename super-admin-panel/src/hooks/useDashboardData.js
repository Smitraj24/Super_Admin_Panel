"use client";

/**
 * Centralized dashboard data hook.
 * Fetches all super-admin dashboard data with caching and deduplication.
 * Multiple components can call this hook — only one network request fires per TTL window.
 */

import { useState, useEffect, useCallback } from "react";
import { cachedFetch } from "@/lib/cache";
import {
  getStatsApi,
  getDepartmentsApi,
  getUsersApi,
  getAdminsApi,
} from "@/services/superAdminApi";
import { getAllUsersAttendanceApi } from "@/services/attandanceApi";
import { getSuperAdminLeavesApi } from "@/services/leaveApi";
import { getHolidaysApi } from "@/services/holidayApi";

const todayStr = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

const monthRange = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const year  = parseInt(parts.find((p) => p.type === "year").value);
  const month = parseInt(parts.find((p) => p.type === "month").value);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    first: `${year}-${String(month).padStart(2, "0")}-01`,
    last:  `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
};

export function useSuperAdminDashboardData(refreshInterval = 30_000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const today = todayStr();
      const { first, last } = monthRange();

      const [statsRes, deptsRes, usersRes, adminsRes, todayAtt, monthAtt, leavesRes, holidaysRes] =
        await Promise.all([
          cachedFetch("sa:stats", () => getStatsApi(), 30_000),
          cachedFetch("sa:departments", () => getDepartmentsApi(), 120_000),
          cachedFetch("sa:users", () => getUsersApi(), 120_000),
          cachedFetch("sa:admins", () => getAdminsApi(), 120_000),
          cachedFetch(`sa:att:today:${today}`, () => getAllUsersAttendanceApi(today, today), 30_000),
          cachedFetch(`sa:att:month:${first}`, () => getAllUsersAttendanceApi(first, last), 60_000),
          cachedFetch("sa:leaves", () => getSuperAdminLeavesApi(), 60_000),
          cachedFetch("sa:holidays", () => getHolidaysApi(), 3_600_000),
        ]);

      setData({ statsRes, deptsRes, usersRes, adminsRes, todayAtt, monthAtt, leavesRes, holidaysRes });
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    if (!refreshInterval) return;
    const t = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(t);
  }, [fetchAll, refreshInterval]);

  return { data, loading, error, refresh: fetchAll };
}
