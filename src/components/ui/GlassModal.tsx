'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

import { Portal } from './Portal';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  isBottomSheetOnMobile?: boolean;
}

export function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  isBottomSheetOnMobile = true,
}: GlassModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal containerId="modal-root">
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        {/* Translucent Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Glass Modal Box / Bottom Sheet */}
        <div
          className={`relative z-10 w-full max-w-lg glass-panel-elevated p-5 sm:p-8 shadow-2xl transition-all ${
            isBottomSheetOnMobile
              ? 'max-sm:fixed max-sm:bottom-0 max-sm:rounded-b-none max-sm:rounded-t-3xl max-sm:max-h-[92dvh] max-sm:overflow-y-auto max-sm:pb-8 max-sm:p-5'
              : 'rounded-2xl sm:rounded-3xl'
          } ${className}`}
        >
          {isBottomSheetOnMobile && (
            <div className="w-12 h-1.5 rounded-full bg-[var(--text-tertiary)]/40 mx-auto mb-3 sm:hidden" />
          )}
          <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-[var(--border-glass)]">
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                {title}
              </h3>
            )}
            <button
              onClick={onClose}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)] transition-colors ml-auto cursor-pointer active:scale-95"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </Portal>
  );
}
