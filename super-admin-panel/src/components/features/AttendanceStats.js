"use client";

import { Users, Clock, AlertCircle, UserX, Coffee } from "lucide-react";

export default function AttendanceStats({ stats }) {
  const statCards = [
    {
      title: "Present Today",
      value: stats?.presentToday ?? 0,
      icon: Users,
      conBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Work Hours",
      value:
        typeof stats?.totalWorkHours === "number"
          ? `${stats.totalWorkHours}h`
          : "0h",
      icon: Clock,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Late Check-ins",
      value: stats?.lateCheckIns ?? 0,
      icon: AlertCircle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Absent Today",
      value: stats?.absentToday ?? 0,
      icon: UserX,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "On Break",
      value: stats?.onBreak ?? 0,
      icon: Coffee,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];
  //
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}
            >
              <card.icon className={card.iconColor} size={20} />
            </div>
          </div>

          <div className="mb-1">
            <h3 className="text-xl font-bold text-slate-900">{card.value}</h3>
            <p className="text-xs text-slate-600 mt-1">{card.title}</p>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-medium ${
                card.changeType === "positive"
                  ? "text-green-600"
                  : card.changeType === "negative"
                    ? "text-red-600"
                    : "text-slate-600"
              }`}
            >
              {card.changeType === "positive" && "↑ "}
              {card.changeType === "negative" && "↓ "}
              {card.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
