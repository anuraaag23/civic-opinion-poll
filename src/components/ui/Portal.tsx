'use client';

import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

/**
 * Custom Portal component that renders modal dialogs into a dedicated portal root
 * (#modal-root), preventing any z-index or stacking context clipping issues.
 */
export function Portal({ children, containerId = 'modal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const container = document.getElementById(containerId) || document.body;
  return createPortal(children, container);
}
