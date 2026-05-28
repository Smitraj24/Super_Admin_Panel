"use client";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}>
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,111,255,0.08) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)" }} />

      <div className="text-center animate-fade-in relative z-10">
        <div className="relative w-14 h-14 mx-auto mb-5">
          <div className="absolute inset-0 rounded-2xl opacity-20 animate-pulse"
            style={{ background: "linear-gradient(135deg, #7c6fff, #00d4aa)" }} />
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-[#7c6fff] animate-spin"
            style={{ borderTopColor: "#7c6fff" }} />
          <div className="absolute inset-2 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c6fff, #00d4aa)" }}>
            <div className="w-3 h-3 bg-white rounded-full opacity-90" />
          </div>
        </div>
        <p className="text-[var(--text-primary)] font-semibold text-[15px]">Loading your dashboard</p>
        <p className="text-[var(--text-muted)] text-[13px] mt-1">Please wait a moment…</p>
      </div>
    </div>
  );
}
