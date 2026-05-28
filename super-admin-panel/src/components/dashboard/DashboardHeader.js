import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";

export default function DashboardHeader({ refreshing, handleRefresh, title = "Attendance System" }) {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-indigo-400" : ""} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <CalendarIcon size={14} />
          <span className="text-[12px] font-semibold">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}
