import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
  color,
  sparkline,
}) {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    cyan: "bg-cyan-50 text-cyan-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${colorClasses[color]}`}>{icon}</div>
        {sparkline && (
          <div className="flex items-end gap-0.5 h-6">
            {sparkline.map((val, i) => (
              <div
                key={i}
                className={`w-1 rounded-t ${colorClasses[color].split(" ")[0]}`}
                style={{ height: `${(val / Math.max(...sparkline)) * 100}%` }}
              ></div>
            ))}
          </div>
        )}
      </div>

      <h3 className="text-xs text-slate-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>

      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trendUp ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span
            className={`text-xs font-semibold ${trendUp ? "text-green-600" : "text-red-600"}`}
          >
            {trend} from last month
          </span>
        </div>
      )}
    </div>
  );
}
