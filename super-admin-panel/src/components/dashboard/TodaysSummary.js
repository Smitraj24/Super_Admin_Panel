import { Coffee } from "lucide-react";
import SummaryItem from "./SummaryItem";

export default function TodaysSummary({ attendanceData }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-6">
        Today's Summary
      </h3>

      <div className="space-y-4">
        <SummaryItem
          label="Check In"
          value={attendanceData.checkInTime}
          color="green"
        />
        <SummaryItem
          label="Check Out"
          value={attendanceData.checkOutTime}
          color="red"
        />
        <SummaryItem
          label="Total Break Time"
          value={attendanceData.totalBreakTime}
          color="orange"
        />
        <SummaryItem
          label="Working Hours"
          value={attendanceData.workingHours}
          color="blue"
        />
      </div>

      {/* Break Details */}
      {attendanceData.breaks && attendanceData.breaks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-orange-500" />
            Break Details
          </h4>
          <div className="space-y-3">
            {attendanceData.breaks.map((breakItem) => (
              <div
                key={breakItem.index}
                className={`p-3 rounded-lg border ${
                  breakItem.isActive
                    ? "bg-orange-50 border-orange-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">
                    Break #{breakItem.index}
                  </span>
                  {breakItem.isActive && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">
                      {breakItem.breakStart}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span
                      className={`font-medium ${
                        breakItem.isActive
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {breakItem.breakEnd}
                    </span>
                  </div>
                  <span className="text-slate-600 font-semibold">
                    {breakItem.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Progress */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">
            {attendanceData.goalProgress}% of 8h goal
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {attendanceData.workingHours} / 8h
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${attendanceData.goalProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
