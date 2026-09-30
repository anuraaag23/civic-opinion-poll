'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Lock, Vote, CheckCircle2 } from 'lucide-react';

export function LiquidGlassHeroVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center select-none py-6">
      {/* Ambient background glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[var(--accent)]/15 via-transparent to-[var(--success)]/10 blur-3xl -z-10" />

      {/* Floating 3D Liquid Glass Outer Ring */}
      <div
        className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-xl shadow-2xl flex items-center justify-center transition-transform duration-700 ease-out hover:rotate-3"
        style={{
          boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Secondary Inner Nested Glass Sphere */}
        <div
          className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-[var(--border-highlight)] bg-gradient-to-b from-[var(--bg-glass-elevated)] to-[var(--bg-glass)] backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center shadow-lg"
          style={{
            boxShadow: '0 12px 30px -6px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
          }}
        >
          {/* Central 3D Liquid Glass Mera Vote Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-white/20 via-white/10 to-transparent border border-white/40 p-2 flex items-center justify-center shadow-xl mb-2.5 transform transition-transform duration-300 hover:scale-110 overflow-hidden backdrop-blur-md">
            <Image
              src="/meravote-logo.png"
              alt="Mera Vote Logo"
              width={80}
              height={80}
              className="w-full h-full object-contain drop-shadow-md"
              priority
            />
          </div>
          <span className="text-sm sm:text-base font-black tracking-tight text-[var(--text-primary)]">
            Mera Vote
          </span>
          <span className="text-[11px] text-[var(--accent)] mt-0.5 font-bold uppercase tracking-wider">
            मेरा वोट • Bharat
          </span>
        </div>
      </div>

      {/* Floating Interactive Satellite Glass Badges */}
      <div
        className="absolute -top-1 -right-2 sm:right-2 glass-panel-elevated py-2 px-3.5 flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] shadow-lg animate-bounce"
        style={{ animationDuration: '4s' }}
      >
        <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
        <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Zero Identity-Vote Link</span>
      </div>

      <div
        className="absolute -bottom-2 -left-2 sm:left-2 glass-panel-elevated py-2 px-3.5 flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] shadow-lg animate-bounce"
        style={{ animationDuration: '5s' }}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
        <span>One Person, One Response</span>
      </div>

      <div className="absolute top-1/2 -left-4 -translate-y-1/2 hidden sm:flex glass-panel py-2 px-3 items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium shadow-md">
        <Vote className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Public Aggregate Data</span>
      </div>

      <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden sm:flex glass-panel py-2 px-3 items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium shadow-md">
        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
        <span>Tamper-Resistant</span>
      </div>
    </div>
  );
}
