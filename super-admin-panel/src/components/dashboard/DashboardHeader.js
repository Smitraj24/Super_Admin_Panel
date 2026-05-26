import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";

export default function DashboardHeader({ refreshing, handleRefresh }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-slate-900">
            Attendance System
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg transition hover:bg-indigo-50 disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw
              size={18}
              className={`text-indigo-600 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-indigo-600">
          <CalendarIcon size={18} />
          <span className="font-semibold">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
