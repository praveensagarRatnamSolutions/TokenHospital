import React from 'react';

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      <div className="mx-auto max-w-[1080px] min-h-screen flex flex-col bg-white shadow-2xl relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
