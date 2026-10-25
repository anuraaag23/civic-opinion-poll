'use client';

import React from 'react';
import { GlassCard } from './GlassCard';

interface PollSkeletonProps {
  cardCount?: number;
  title?: string;
}

export function PollSkeleton({ cardCount = 6 }: PollSkeletonProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <GlassCard elevated className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
            <div className="h-7 w-56 sm:w-72 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="h-10 w-full sm:w-44 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
        </div>

        {/* Section Label Skeleton */}
        <div className="h-3 w-48 bg-slate-200/80 dark:bg-white/10 rounded-md animate-pulse" />

        {/* Grid of Party Card Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-[#131722]/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Logo Box Placeholder */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0 animate-pulse border border-slate-300/40 dark:border-white/5" />

                {/* Text lines */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
                  <div className="h-4.5 w-32 bg-slate-300 dark:bg-white/15 rounded-md animate-pulse" />
                  <div className="h-3 w-24 bg-slate-200/80 dark:bg-white/5 rounded-md animate-pulse" />
                </div>
              </div>

              {/* Indicator Circle */}
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 shrink-0 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Action Button Skeleton */}
        <div className="pt-4 border-t border-[var(--border-glass)]">
          <div className="h-13 w-full bg-gradient-to-r from-blue-500/20 via-blue-600/30 to-indigo-600/20 rounded-2xl animate-pulse border border-blue-500/20" />
        </div>
      </GlassCard>
    </div>
  );
}
