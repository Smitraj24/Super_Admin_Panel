"use client";

import { memo } from "react";
import { SectionCard } from "./SuperAdminSections";
import { RATE_COLOR } from "./SuperAdminConstants";

const DepartmentSummary = memo(({ deptSummary }) => (
  <SectionCard title="Department Summary">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {["Department", "Employees", "Present", "Rate"].map((h) => (
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
          {deptSummary.slice(0, 5).map((d, i) => (
            <tr
              key={i}
              className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <td className="py-2.5 px-2 text-[13px] text-[var(--text-primary)]">
                {d.department}
              </td>
              <td className="py-2.5 px-2 text-[13px] text-[var(--text-secondary)]">
                {d.employees}
              </td>
              <td className="py-2.5 px-2 text-[13px] text-[var(--text-secondary)]">
                {d.presentToday}
              </td>
              <td className="py-2.5 px-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${RATE_COLOR(d.rate)}`}
                >
                  {d.rate}%
                </span>
              </td>
            </tr>
          ))}
          {deptSummary.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="py-8 text-center text-[var(--text-muted)] text-sm"
              >
                No department data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </SectionCard>
));

DepartmentSummary.displayName = "DepartmentSummary";
export default DepartmentSummary;
