"use client";

import React from "react";

interface ViceVerseLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  showStars?: boolean;
}

export default function ViceVerseLogo({
  size = "md",
  showSubtitle = true,
  showStars = false,
}: ViceVerseLogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* GTA Vice City Palm & Hexagon Neon Emblem */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} flex-shrink-0 group`}>
        {/* Neon Glow Backdrop */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#FF2A85] via-[#FF8C00] to-[#00F0FF] opacity-60 blur-md group-hover:opacity-90 transition-opacity" />
        
        {/* Emblem Body */}
        <div className="relative w-full h-full bg-[#120924] border border-[#FF2A85]/60 rounded-lg flex items-center justify-center p-1.5 shadow-[inset_0_0_12px_rgba(255,42,133,0.3)]">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="viceSun" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF2A85" />
                <stop offset="60%" stopColor="#FF7A00" />
                <stop offset="100%" stopColor="#00F0FF" />
              </linearGradient>
            </defs>
            {/* Retro Sun */}
            <circle cx="20" cy="20" r="14" fill="url(#viceSun)" opacity="0.3" />
            <path d="M7 23h26M9 26h22M12 29h16" stroke="#00F0FF" strokeWidth="1.2" strokeLinecap="round" />
            {/* Hexagon Shield */}
            <polygon
              points="20,2 36,11 36,29 20,38 4,29 4,11"
              stroke="#00F0FF"
              strokeWidth="1.8"
              fill="none"
              strokeLinejoin="round"
            />
            {/* Stylized Palm Tree Silhouette */}
            <path
              d="M20 34V16M20 16C17 12 11 13 8 16M20 16C18 10 13 8 9 9M20 16C23 12 29 13 32 16M20 16C22 10 27 8 31 9M20 16C20 10 20 6 20 6"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span
            className={`font-gta tracking-wider uppercase font-bold ${textSizes[size]} leading-none`}
            style={{
              background: "linear-gradient(135deg, #FF2A85 0%, #FF8C00 45%, #00F0FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px rgba(255,42,133,0.4))",
            }}
          >
            VICEVERSE
          </span>
          {showStars && (
            <div className="flex items-center gap-0.5 text-[#FFB800]">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xs drop-shadow-[0_0_6px_rgba(255,184,0,0.8)]">★</span>
              ))}
            </div>
          )}
        </div>
        {showSubtitle && (
          <p className="font-hud text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[#00F0FF] leading-tight mt-0.5">
            CLUB MEMBER OPERATIONS // VICE CITY 2026
          </p>
        )}
      </div>
    </div>
  );
}
