'use client';

import React from 'react';

interface PaymentMethodProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentMethod({ onNext, onBack }: PaymentMethodProps) {
  const methods = [
    { id: 'cash', title: 'Cash at Counter', desc: 'Pay at the reception desk', icon: 'payments' },
    { id: 'upi', title: 'UPI Payment', desc: 'Scan and pay using any UPI app', icon: 'qr_code_2' },
    { id: 'card', title: 'Card Payment', desc: 'Swipe or tap your credit/debit card', icon: 'credit_card' },
    { id: 'insurance', title: 'Insurance', desc: 'Claim through your provider', icon: 'health_and_safety' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* TopAppBar Section */}
      <header className="pt-12 pb-8 px-8 border-b border-slate-200">
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
            <span className="material-symbols-outlined !text-5xl">medical_services</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">City General Hospital</h2>
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">Select Payment Method</h1>
          <p className="text-2xl text-slate-500 max-w-2xl mx-auto font-medium">
            Please choose how you would like to pay for the consultation.
          </p>
        </div>
      </header>

      {/* Main Section: Grid of Payment Options */}
      <main className="flex-1 flex items-center justify-center p-12 bg-slate-50/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl">
          {methods.map((method) => (
            <button 
              key={method.id}
              onClick={onNext}
              className="group flex flex-col items-center justify-between p-10 bg-white border-4 border-slate-100 rounded-[2rem] shadow-xl hover:border-blue-500 transition-all duration-300 active:scale-95 text-center h-[450px] kiosk-button"
            >
              <div className="w-full h-56 bg-slate-50 group-hover:bg-blue-50/50 rounded-2xl flex items-center justify-center mb-6 overflow-hidden relative">
                <span className="material-symbols-outlined !text-[120px] text-blue-500">{method.icon}</span>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-4 text-slate-900">{method.title}</h3>
                <p className="text-xl text-slate-500 font-medium">{method.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Navigation Section */}
      <footer className="p-12 border-t border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center max-w-5xl mx-auto gap-8">
          <button 
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-4 py-8 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 text-3xl font-bold active:bg-slate-100 transition-colors shadow-sm kiosk-button"
          >
            <span className="material-symbols-outlined !text-4xl">arrow_back</span>
            <span>Back</span>
          </button>
          <button 
            onClick={onNext}
            className="flex-[1.5] flex items-center justify-center gap-4 py-8 rounded-2xl bg-blue-500 text-white text-3xl font-bold active:brightness-90 transition-all shadow-lg shadow-blue-500/30 kiosk-button"
          >
            <span>Continue</span>
            <span className="material-symbols-outlined !text-4xl">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
