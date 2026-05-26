export default function SummaryItem({ label, value, color }) {
  const colorClasses = {
    green: "text-green-600",
    red: "text-red-600",
    orange: "text-orange-600",
    blue: "text-blue-600",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-lg font-bold ${colorClasses[color]}`}>
        {value}
      </span>
    </div>
  );
}
