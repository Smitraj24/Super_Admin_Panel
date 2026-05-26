export default function QuickActionButton({
  icon,
  label,
  subtitle,
  color = "blue",
  onClick,
  disabled = false,
}) {
  const colorClasses = {
    green: {
      bg: "bg-green-50",
      iconBg: "bg-green-500",
      border: "border-green-100",
      text: "text-slate-800",
      subtitle: "text-slate-500",
    },
    orange: {
      bg: "bg-orange-50",
      iconBg: "bg-orange-500",
      border: "border-orange-100",
      text: "text-slate-800",
      subtitle: "text-slate-500",
    },
    blue: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
      border: "border-blue-100",
      text: "text-slate-800",
      subtitle: "text-slate-500",
    },
    red: {
      bg: "bg-red-50",
      iconBg: "bg-red-500",
      border: "border-red-100",
      text: "text-slate-800",
      subtitle: "text-slate-500",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-6 transition-all hover:shadow-md ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:scale-105"
      }`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={`${colors.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center text-white`}
        >
          {icon}
        </div>

        <div>
          <p className={`font-bold text-base ${colors.text}`}>{label}</p>

          <p className={`text-sm ${colors.subtitle}`}>{subtitle}</p>
        </div>
      </div>
    </button>
  );
}
