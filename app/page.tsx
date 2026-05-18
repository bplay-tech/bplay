import Link from "next/link";
import { BplayLogo } from "@/components/ui/BplayLogo";
import { HomeTicker } from "@/components/home/HomeTicker";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#0B0F1A" }}>
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 15% 50%, rgba(90,60,200,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <BplayLogo size="md" />
        <Link
          href="/login"
          className="text-sm font-medium text-white transition-opacity hover:opacity-70"
        >
          Login
        </Link>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight text-white">
          Reality, resolved
          <br />
          <span className="inline">in </span>
          <span style={{ color: "#7C5CFF" }}>real time.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg max-w-sm" style={{ color: "#9CA3AF" }}>
          Discover prediction markets across politics, sports, crypto,
          <br className="hidden sm:block" /> and more
        </p>

        <Link
          href="/login"
          className="mt-10 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: "#7C5CFF" }}
        >
          Get Started
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </main>

      {/* Live crypto ticker */}
      <HomeTicker />

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between px-8 py-6 text-xs" style={{ color: "#9CA3AF" }}>
        <nav className="flex gap-6">
          {["Terms", "Privacy", "Risk"].map((label) => (
            <a
              key={label}
              href="#"
              className="hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <span>© 2026 bplay</span>
      </footer>
    </div>
  );
}
