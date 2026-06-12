"use client";

import { memo } from "react";

const NavIconBtn = memo(({ onClick, children, className = "", badge }) => (
  <button
    onClick={onClick}
    className={`relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-150 ${className}`}
  >
    {children}
    {badge > 0 && (
      <span className="absolute top-1 right-1 min-w-[15px] h-[15px] bg-rose-500  text-[9px] rounded-full flex items-center justify-center font-bold px-0.5 shadow-lg">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </button>
));
NavIconBtn.displayName = "NavIconBtn";

export default NavIconBtn;
