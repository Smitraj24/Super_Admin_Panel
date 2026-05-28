"use client";

import { useRouter } from "next/navigation";

const COLOR_MAP = {
  green: {
    icon: "bg-[#10b981]/15 text-[#34d399] border-[#10b981]/20",
    glow:
      "hover:border-[#10b981]/40 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.6)] hover:scale-[1.03] hover:opacity-100",
  },
  orange: {
    icon: "bg-[#f97316]/12 text-[#fb923c] border-[#f97316]/20",
    glow: "hover:border-[#f97316]/30 hover:shadow-[#f97316]/10",
  },
  blue: {
    icon: "bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/20",
    glow:
      "hover:border-[#3b82f6]/40 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.6)] hover:scale-[1.03] hover:opacity-100",
  },
  red: {
    icon: "bg-rose-500/12 text-rose-400 border-rose-500/20",
    glow: "hover:border-rose-500/30 hover:shadow-rose-500/10",
  },
  purple: {
    icon: "bg-[#7c6fff]/15 text-[#a78bfa] border-[#7c6fff]/20",
    glow:
      "hover:border-[#7c6fff]/40 hover:shadow-[0_10px_30px_-10px_rgba(124,111,255,0.6)] hover:scale-[1.03] hover:opacity-100",
  },
  indigo: {
    icon: "bg-[#6366f1]/12 text-[#818cf8] border-[#6366f1]/20",
    glow: "hover:border-[#6366f1]/30 hover:shadow-[#6366f1]/10",
  },
};

export default function QuickActionButton({
  icon,
  label,
  subtitle,
  color = "blue",
  onClick,
  path,
  disabled = false,
}) {
  const router = useRouter();

  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;

  const handleClick = () => {
    if (disabled) return;

    if (onClick) {
      onClick();
    } else if (path) {
      router.push(path);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        group relative w-full text-left rounded-2xl p-4 border border-[var(--border)]
        transition-all duration-300 ease-out
        hover:shadow-lg hover:-translate-y-1
        ${c.glow}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
      `}
      style={{
        background: "var(--bg-surface)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${c.icon}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">
            {label}
          </p>

          {subtitle && (
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}