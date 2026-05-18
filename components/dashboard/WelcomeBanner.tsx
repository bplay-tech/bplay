"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { TIER_DISPLAY, type TierName } from "@/lib/tiers";

interface WelcomeBannerProps {
  firstName: string;
  role: string;
  tierName?: string;
  commissionRate?: number;
}

const USER_PHRASES = (name: string) => [
  `Welcome, ${name}!`,
  `Good to see you, ${name}!`,
  `Ready to grow, ${name}?`,
];

const ADMIN_PHRASES = (name: string) => [
  `Welcome back, ${name}!`,
  `Good to see you, ${name}!`,
  `Let's grow, ${name}!`,
];

export function WelcomeBanner({ firstName, role, tierName, commissionRate }: WelcomeBannerProps) {
  const isUser = role === "USER";
  const phrases = isUser ? USER_PHRASES(firstName) : ADMIN_PHRASES(firstName);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const tierDisplay = tierName && role !== "USER" ? TIER_DISPLAY[tierName as TierName] : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-7"
      style={{
        background: "linear-gradient(135deg, #1a1a3e 0%, #16213e 40%, #0d3b3b 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-80 h-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top right, rgba(0,180,150,0.18) 0%, transparent 70%)" }}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-white transition-all duration-400"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-6px)" }}
          >
            {phrases[index]}
          </h1>
          {!isUser && commissionRate !== undefined && (
            <p className="text-white/60 mt-1 text-sm">
              You&apos;re earning{" "}
              <span className="font-semibold" style={{ color: "#a78bfa" }}>
                {commissionRate}% commission
              </span>{" "}
              on every sale
            </p>
          )}
          {isUser && (
            <p className="text-white/60 mt-1 text-sm">Your BPLAY token dashboard</p>
          )}
        </div>
        {tierDisplay && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shrink-0"
            style={{
              border: "1px solid rgba(167,139,250,0.5)",
              background: "rgba(124,92,255,0.15)",
              color: "#c4b5fd",
            }}
          >
            <Zap className="h-4 w-4" />
            {tierDisplay.label}
          </div>
        )}
      </div>
    </div>
  );
}
