'use client';

import { useEffect } from 'react';

export function LiquidGlassInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cleanup: (() => void) | undefined;

    const scriptsToLoad = [
      '/liquid-glass/glass-engine.js',
      '/liquid-glass/glass-tabbar.js',
      '/liquid-glass/glass-toggle.js',
      '/liquid-glass/glass-slider.js',
      '/liquid-glass/glass-segmented.js',
      '/liquid-glass/glass-button.js',
      '/liquid-glass/glass-card.js',
    ];

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const id = `lg-script-${src.replace(/[^a-zA-Z0-9]/g, '-')}`;
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = false; // Preserve sequential loading order
        script.onload = () => resolve();
        script.onerror = () => resolve(); // don't block others
        document.body.appendChild(script);
      });
    };

    const triggerAllInits = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.LiquidGlass && typeof win.LiquidGlass.autoInit === 'function') {
        win.LiquidGlass.autoInit(document);
      }
      if (win.LiquidGlassTabbar && typeof win.LiquidGlassTabbar.initAll === 'function') {
        win.LiquidGlassTabbar.initAll(document);
      }
      if (win.LiquidGlassToggle && typeof win.LiquidGlassToggle.initAll === 'function') {
        win.LiquidGlassToggle.initAll(document);
      }
      if (win.LiquidGlassSlider && typeof win.LiquidGlassSlider.initAll === 'function') {
        win.LiquidGlassSlider.initAll(document);
      }
      if (win.LiquidGlassSegmented && typeof win.LiquidGlassSegmented.initAll === 'function') {
        win.LiquidGlassSegmented.initAll(document);
      }
      if (win.LiquidGlassButton && typeof win.LiquidGlassButton.initAll === 'function') {
        win.LiquidGlassButton.initAll(document);
      }
      if (win.LiquidGlassCard && typeof win.LiquidGlassCard.initAll === 'function') {
        win.LiquidGlassCard.initAll(document);
      }
    };

    const initEngine = async () => {
      try {
        for (const src of scriptsToLoad) {
          await loadScript(src);
        }

        triggerAllInits();

        // MutationObserver to auto-enhance newly mounted dynamic routes / elements
        const observer = new MutationObserver(() => {
          triggerAllInits();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        cleanup = () => {
          observer.disconnect();
        };
      } catch (err) {
        console.warn('Liquid Glass engine dynamic init notice:', err);
      }
    };

    initEngine();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return null;
}
