"use client";

import { memo } from "react";
import { SectionCard } from "./SuperAdminSections";
import { LEAVE_COLOR } from "./SuperAdminConstants";

const RecentLeaves = memo(({ recentLeaves }) => (
  <SectionCard title="Recent Leaves">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {["Employee", "Type", "From", "To", "Status"].map((h) => (
              <th
                key={h}
                className="text-left py-2 px-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recentLeaves.map((l, i) => (
            <tr
              key={i}
              className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <td className="py-2.5 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-bold flex items-center justify-center">
                    {l.employee.charAt(0)}
                  </div>
                  <span className="text-[13px] text-[var(--text-primary)] truncate max-w-[80px]">
                    {l.employee}
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-2 text-[13px] text-[var(--text-secondary)] whitespace-nowrap">
                {l.leaveType}
              </td>
              <td className="py-2.5 px-2 text-[13px] text-[var(--text-secondary)]">
                {l.from}
              </td>
              <td className="py-2.5 px-2 text-[13px] text-[var(--text-secondary)]">
                {l.to}
              </td>
              <td className="py-2.5 px-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${LEAVE_COLOR(l.status)}`}
                >
                  {l.status}
                </span>
              </td>
            </tr>
          ))}
          {recentLeaves.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="py-8 text-center text-[var(--text-muted)] text-sm"
              >
                No recent leaves
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </SectionCard>
));

RecentLeaves.displayName = "RecentLeaves";
export default RecentLeaves;
