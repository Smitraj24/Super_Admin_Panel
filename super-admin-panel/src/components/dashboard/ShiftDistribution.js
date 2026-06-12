"use client";

import { memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SectionCard } from "./SuperAdminSections";

const SHIFT_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#8b5cf6"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, percentage } = payload[0].payload;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 shadow-lg text-[12px]">
      <p className="font-semibold text-[var(--text-primary)]">{name}</p>
      <p className="text-[var(--text-muted)]">
        {value} employees ({percentage}%)
      </p>
    </div>
  );
};

const ShiftDistribution = memo(({ shiftData, mounted }) => {
  const hasData = shiftData && shiftData.length > 0;

  return (
    <SectionCard title="Shift Distribution">
      {mounted && hasData ? (
        <>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={shiftData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {shiftData.map((_, i) => (
                    <Cell key={i} fill={SHIFT_COLORS[i % SHIFT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {shiftData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: SHIFT_COLORS[i % SHIFT_COLORS.length] }}
                  />
                  <span className="text-[13px] text-[var(--text-secondary)]">
                    {s.name}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  {s.value}{" "}
                  <span className="text-[11px] font-normal text-[var(--text-muted)]">
                    ({s.percentage}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-[var(--text-muted)] text-sm">
          {mounted ? "No shift data for today" : "Loading…"}
        </div>
      )}
    </SectionCard>
  );
});

ShiftDistribution.displayName = "ShiftDistribution";
export default ShiftDistribution;
