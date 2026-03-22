import React from 'react';
import KioskProvider from './KioskProvider';
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return <KioskProvider>{children}</KioskProvider>;
}
