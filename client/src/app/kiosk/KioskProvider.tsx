'use client';
import React, { useEffect } from 'react';
import './kiosk.css';

function setRootFoot() {
  const baseHeight = 1920;
  const elementHeight = window.innerHeight;

  const scale = elementHeight / baseHeight;

  const min = 10;
  const max = 18;

  const fontSize = Math.max(min, Math.min(max, Math.floor(16 * scale)));

  document.documentElement.style.fontSize = `${fontSize}px`;
}

const KioskProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    setRootFoot();
    window.addEventListener('resize', setRootFoot);

    return () => window.removeEventListener('resize', setRootFoot);
  }, []);
  return (
    <div className="kiosk-root">
      <div className="kiosk-container">
        <div className="kiosk-inner">{children}</div>
      </div>
    </div>
  );
};

export default KioskProvider;
