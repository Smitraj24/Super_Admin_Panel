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

const todayStr = () => new Date().toISOString().split("T")[0];
const monthRange = () => {
  const now = new Date();
  return {
    first: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0],
    last: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0],
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
