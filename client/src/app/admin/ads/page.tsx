'use client';

import React, { useEffect, useState } from 'react';
import { AdList } from '@/modules/admin/ads';

export default function AdminAds() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode from the document
  useEffect(() => {
    const detectDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial detection
    detectDarkMode();

    // Listen for changes
    const observer = new MutationObserver(detectDarkMode);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      <AdList isDarkMode={isDarkMode} />
    </div>
  );
}


