import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, ShieldCheck, User, Phone, ArrowLeft, ChevronRight } from 'lucide-react';
import type { Department, Doctor } from '../../types';

interface StepPaymentSelectionProps {
  department: Department;
  doctor: Doctor;
  onProceed: (data: { name: string; phone: string; method: string }) => void;
  onBack: () => void;
}

const StepPaymentSelection: React.FC<StepPaymentSelectionProps> = ({ department, doctor, onProceed, onBack }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'CASH' | 'ONLINE'>('CASH');
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!phone.trim() || phone.length < 10) return setError('Please enter a valid phone number');
    setError('');
    onProceed({ name, phone, method });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-500">
      {/* Header */}
      <header className="pt-20 pb-12 px-12 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-3xl">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-4 text-slate-400 dark:text-white/30 hover:text-sky-500 transition-colors mb-12 group"
          >
            <div className="size-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all shadow-sm">
              <ArrowLeft size={20} />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">Step Back</span>
          </button>

          <div className="size-20 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-8">
            <CreditCard className="text-sky-500 dark:text-sky-400" size={40} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Final Details</h1>
          <p className="text-xl text-slate-500 dark:text-white/40 font-medium mb-12 uppercase tracking-widest leading-relaxed">
            Registering for <span className="text-sky-600 dark:text-sky-400 font-black">{doctor.name}</span> in <span className="text-sky-600 dark:text-sky-400 font-black">{department.name}</span>
          </p>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
          
          {/* Patient Details Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 dark:text-sky-400">
                <User size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Patient Information</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Full Patient Name</label>
                <div className="relative group">
                  <User size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/10 group-focus-within:text-sky-500 transition-colors" />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all placeholder:text-slate-300 dark:placeholder:text-white/10"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Mobile Phone Number</label>
                <div className="relative group">
                  <Phone size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/10 group-focus-within:text-sky-500 transition-colors" />
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all placeholder:text-slate-300 dark:placeholder:text-white/10"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Banknote size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Select Payment Method</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <button 
                onClick={() => setMethod('CASH')}
                className={`
                  flex flex-col items-center p-8 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden
                  ${method === 'CASH' ? 'bg-sky-500/10 border-sky-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-sky-500/30'}
                `}
              >
                <Banknote className={`size-16 mb-4 transition-colors ${method === 'CASH' ? 'text-sky-500' : 'text-slate-300 dark:text-white/20'}`} />
                <span className={`text-xl font-black uppercase tracking-widest ${method === 'CASH' ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-white/20'}`}>Cash at Counter</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${method === 'CASH' ? 'text-sky-600/60 dark:text-white/40' : 'text-slate-200 dark:text-white/10'}`}>Pay during consultation</span>
                {method === 'CASH' && (
                  <motion.div layoutId="paymentActive" className="absolute top-4 right-4 text-sky-500">
                    <ShieldCheck size={24} />
                  </motion.div>
                )}
              </button>

              <button 
                onClick={() => setMethod('ONLINE')}
                className={`
                  flex flex-col items-center p-8 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden
                  ${method === 'ONLINE' ? 'bg-sky-500/10 border-sky-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-sky-500/30'}
                `}
              >
                <CreditCard className={`size-16 mb-4 transition-colors ${method === 'ONLINE' ? 'text-sky-500' : 'text-slate-300 dark:text-white/20'}`} />
                <span className={`text-xl font-black uppercase tracking-widest ${method === 'ONLINE' ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-white/20'}`}>Fast Online Pay</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${method === 'ONLINE' ? 'text-sky-600/60 dark:text-white/40' : 'text-slate-200 dark:text-white/10'}`}>UPI / Cards / Net Banking</span>
                {method === 'ONLINE' && (
                  <motion.div layoutId="paymentActive" className="absolute top-4 right-4 text-sky-500">
                    <ShieldCheck size={24} />
                  </motion.div>
                )}
              </button>
            </div>
          </section>

          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-center font-black uppercase tracking-widest text-xs"
            >
              {error}
            </motion.div>
          )}

          <button 
            onClick={validate}
            className="w-full h-24 rounded-[3rem] bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center gap-4 transition-all shadow-2xl shadow-sky-500/20 active:scale-[0.98]"
          >
            <span className="text-3xl font-black uppercase tracking-[0.2em] ml-8">Generate Token</span>
            <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronRight size={24} />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default StepPaymentSelection;
