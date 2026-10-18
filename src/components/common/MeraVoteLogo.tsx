'use client';

import React from 'react';

interface MeraVoteLogoProps {
  size?: number;
  className?: string;
  showShadow?: boolean;
}

export function MeraVoteLogo({
  size = 40,
  className = '',
  showShadow = true,
}: MeraVoteLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Main Royal Blue Squircle Gradient */}
        <linearGradient id="mv-squircle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Soft Glass Highlight */}
        <linearGradient id="mv-top-glow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Ballot Box Metallic Navy Gradient */}
        <linearGradient id="mv-box-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Drop Shadow Filter */}
        <filter id="mv-card-shadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
        </filter>
        <filter id="mv-box-shadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* ── 1. SQUIRCLE EMBLEM BACKGROUND ── */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="22"
        fill="url(#mv-squircle-grad)"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="1.5"
      />

      {/* Top Glass Sheen */}
      <path
        d="M 4 26 C 4 13.8 13.8 4 26 4 L 74 4 C 86.2 4 96 13.8 96 26 C 96 35 60 44 4 33 Z"
        fill="url(#mv-top-glow)"
      />

      {/* ── 2. BALLOT CARD (Entering the slot) ── */}
      <g filter="url(#mv-card-shadow)">
        {/* Card Body */}
        <rect
          x="26"
          y="15"
          width="48"
          height="45"
          rx="5"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1"
        />

        {/* Indian Tricolor Header Strip */}
        {/* Saffron */}
        <path
          d="M 26 20 C 26 17.2 28.2 15 31 15 L 69 15 C 71.8 15 74 17.2 74 20 L 74 21 L 26 21 Z"
          fill="#F97316"
        />
        {/* Emerald Stripe */}
        <rect x="26" y="21" width="48" height="2" fill="#10B981" />

        {/* Verified Circular Stamp on Card */}
        <circle cx="50" cy="34" r="9.5" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.8" />
        {/* Emerald Checkmark */}
        <path
          d="M 45 34 L 48.5 37.5 L 55 30.5"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* ── 3. BALLOT BOX FRONT (Navy Slate) ── */}
      <g filter="url(#mv-box-shadow)">
        {/* Box Body */}
        <rect
          x="16"
          y="46"
          width="68"
          height="44"
          rx="7"
          fill="url(#mv-box-grad)"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.2"
        />

        {/* Slot Opening */}
        <rect
          x="24"
          y="50.5"
          width="52"
          height="4.5"
          rx="2.25"
          fill="#020617"
          stroke="#60A5FA"
          strokeWidth="1"
        />

        {/* Central Verified Civic Seal */}
        <circle
          cx="50"
          cy="70"
          r="9"
          fill="rgba(30, 58, 138, 0.7)"
          stroke="#60A5FA"
          strokeWidth="1.4"
        />
        <path
          d="M 46 70 L 49 73 L 54.5 67"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Indian Tricolor Indicator Dots */}
        <circle cx="43" cy="83" r="2.2" fill="#F97316" />
        <circle cx="50" cy="83" r="2.2" fill="#FFFFFF" />
        <circle cx="57" cy="83" r="2.2" fill="#10B981" />
      </g>
    </svg>
  );
}
