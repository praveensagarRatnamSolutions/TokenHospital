'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, CheckCircle2, Ticket, User, Stethoscope, Banknote, CreditCard, Smartphone, Zap, AlertTriangle } from 'lucide-react';
import api from '@/services/api';
import { useCreateToken, useCreatePaymentOrder, useVerifyOnlinePayment } from '../hooks';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
}

export default function CreateTokenModal({ isOpen, onClose, hospitalId }: CreateTokenModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [patientPhone, setPatientPhone] = useState<any>({ full: '' });
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [isEmergency, setIsEmergency] = useState(false);

  // Load Razorpay
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch Departments & Doctors
  const { data: deptsRes } = useQuery({
    queryKey: ['departments', hospitalId],
    queryFn: () => api.get('/api/department').then(res => res.data),
    enabled: isOpen,
  });
  const departments = Array.isArray(deptsRes?.data) ? deptsRes.data : deptsRes || [];

  const { data: docsRes } = useQuery({
    queryKey: ['doctors', departmentId],
    queryFn: () => api.get('/api/doctor', { params: { departmentId } }).then(res => res.data),
    enabled: !!departmentId,
  });
  const doctors = docsRes?.doctors || [];

  // Hooks
  const createTokenMutation = useCreateToken();
  const createOrderMutation = useCreatePaymentOrder();
  const verifyPaymentMutation = useVerifyOnlinePayment();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Token
      const tokenRes = await createTokenMutation.mutateAsync({
        departmentId,
        doctorId: doctorId || undefined,
        appointmentDate,
        paymentType,
        patientDetails: {
          name: patientName,
          phone: patientPhone,
          age: patientAge ? parseInt(patientAge) : undefined,
          gender: patientGender,
        },
        isEmergency,
      });

      const token = tokenRes.data;

      // 2. If online payment, initiate Razorpay
      if (paymentType === 'UPI' || paymentType === 'CARD') {
        const orderRes = await createOrderMutation.mutateAsync({
           // Example flat amount for token booking, this might usually come from doctor/dept fees 
           // but we'll assume a standard consulting fee or require user to input. Let's assume 500 for now.
           amount: 500, 
           tokenId: token._id,
           patientId: typeof token.patientId === 'object' ? token.patientId._id : token.patientId,
           method: paymentType
        });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKey',
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          name: "Hospital Queue System",
          description: "Consultation Fee",
          order_id: orderRes.data.id,
          handler: async function (response: any) {
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert('Payment Successful & Token Confirmed!');
            onClose();
          },
          prefill: {
            name: patientName,
            contact: patientPhone.full
          },
          theme: { color: "#3b82f6" }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        alert('Provisional Token Created (Cash Payment Pending)!');
        onClose();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div>
             <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
               <Ticket className="text-primary w-6 h-6" /> Generate New Token
             </h2>
             <p className="text-sm font-medium text-slate-500 mt-1">Register a patient and collect consultation fee.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="tokenForm" onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Patient details */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-4 text-primary">
                  <User className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-widest text-xs">1. Patient Information</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <PhoneInput
                      country={'in'}
                      value={patientPhone.full}
                      onChange={(value, data: any) => {
                          setPatientPhone({
                              full: value,
                              countryCode: `+${data.dialCode}`,
                              country: data.countryCode?.toUpperCase(),
                              nationalNumber: value.replace(data.dialCode, '')
                          });
                      }}
                      inputClass="!w-full !p-3 !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !focus:!ring-2 !focus:!ring-primary !outline-none"
                      containerClass="!w-full"
                      buttonClass="!bg-slate-50 dark:!bg-slate-800 !border-none !rounded-l-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input required type="text" value={patientName} onChange={e => setPatientName(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                    <input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="25" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                    <select value={patientGender} onChange={e => setPatientGender(e.target.value as any)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none">
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                       <option value="Other">Other</option>
                    </select>
                  </div>
               </div>
            </div>

            {/* Step 2: Consultation & Payment */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 mb-4 text-primary">
                  <Stethoscope className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-widest text-xs">2. Consultation Details</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                    <select required value={departmentId} onChange={e => {setDepartmentId(e.target.value); setDoctorId('');}} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none">
                       <option value="">Select Department</option>
                       {departments.map((d: any) => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                       ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Doctor (Optional)</label>
                    <select value={doctorId} onChange={e => setDoctorId(e.target.value)} disabled={!departmentId} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none disabled:opacity-50">
                       <option value="">Auto-assign</option>
                       {doctors.map((d: any) => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                       ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Appointment Date</label>
                    <input required type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Method</label>
                    <div className="flex gap-2">
                       <button type="button" onClick={() => setPaymentType('CASH')} className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentType === 'CASH' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                          <Banknote className="w-5 h-5 mb-1" />
                          <span className="text-xs font-bold">CASH</span>
                       </button>
                       <button type="button" onClick={() => setPaymentType('UPI')} className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentType === 'UPI' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                          <Smartphone className="w-5 h-5 mb-1" />
                          <span className="text-xs font-bold">UPI</span>
                       </button>
                       <button type="button" onClick={() => setPaymentType('CARD')} className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentType === 'CARD' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                          <CreditCard className="w-5 h-5 mb-1" />
                          <span className="text-xs font-bold">CARD</span>
                       </button>
                    </div>
                  </div>
               </div>
            </div>

            <div className="pt-4">
              <button 
                type="button"
                onClick={() => setIsEmergency(!isEmergency)}
                className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                  isEmergency 
                  ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200 dark:shadow-red-900/20 scale-[1.02]' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-red-200'
                }`}
              >
                <div className={`p-3 rounded-2xl transition-colors ${isEmergency ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <Zap className={`w-6 h-6 ${isEmergency ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className="text-left flex-1">
                  <span className={`block text-sm font-black uppercase tracking-widest ${isEmergency ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    Emergency Priority
                  </span>
                  <span className={`block text-[10px] font-bold ${isEmergency ? 'text-white/80' : 'text-slate-400'}`}>
                    Jump to the front of the queue • Immediate Attention
                  </span>
                </div>
                {isEmergency && <div className="w-3 h-3 bg-white rounded-full animate-ping" />}
              </button>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
             Cancel
          </button>
          <button form="tokenForm" type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center gap-2">
             {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <Ticket className="w-5 h-5" />}
             {loading ? 'Processing...' : (paymentType === 'CASH' ? 'Create Token' : 'Proceed to Pay')}
          </button>
        </div>
      </div>
    </div>
  );
}
