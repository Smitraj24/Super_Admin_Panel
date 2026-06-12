"use client";

import { memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { SectionCard } from "./SuperAdminSections";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 shadow-lg text-[12px]">
      <p className="font-semibold text-[var(--text-primary)] mb-1">
        {payload[0]?.payload?.fullLabel || label}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const AttendanceTrend = memo(({ trend, mounted }) => (
  <SectionCard title="7-Day Attendance Trend" className="lg:col-span-1">
    {mounted && trend.length > 0 ? (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="present"
            name="Present"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#gradPresent)"
            dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="absent"
            name="Absent"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#gradAbsent)"
            dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-[220px] flex items-center justify-center text-[var(--text-muted)] text-sm">
        {mounted ? "No trend data available" : "Loading…"}
      </div>
    )}
    <div className="mt-3 flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
        Present
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
        Absent
      </span>
    </div>
  </SectionCard>
));

AttendanceTrend.displayName = "AttendanceTrend";
export default AttendanceTrend;
