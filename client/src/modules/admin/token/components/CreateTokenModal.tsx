'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Ticket,
  User,
  Stethoscope,
  Banknote,
  CreditCard,
  Smartphone,
  Zap,
  ChevronRight,
  ShieldCheck,
  Search,
  Clock,
  CalendarDays,
  Info,
} from 'lucide-react';
import api from '@/services/api';
import { useCreateToken, useCreatePaymentOrder, useVerifyOnlinePayment } from '../hooks';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import PhoneNumberInput from '@/components/common/phone-input';

export default function CreateTokenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const hospitalId = user?.hospitalId;
  const [search, setSearch] = useState('');

  // Form State
  const [patientPhone, setPatientPhone] = useState<any>({ full: '' });
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [paymentMethod, setpaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [isEmergency, setIsEmergency] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const { data: deptsRes } = useQuery({
    queryKey: ['departments', hospitalId],
    queryFn: () => api.get('/api/department').then((res) => res.data),
  });
  const departments = Array.isArray(deptsRes?.data) ? deptsRes.data : deptsRes || [];

  const { data: docsRes } = useQuery({
    queryKey: ['doctors', departmentId],
    queryFn: () =>
      api.get('/api/doctor', { params: { departmentId } }).then((res) => res.data),
    enabled: !!departmentId,
  });
  const doctors = docsRes?.doctors || [];
  const selectedDoctor = doctors.find((d: any) => d._id === doctorId);

  // Check if Razorpay is enabled
  const { data: razorpayRes } = useQuery({
    queryKey: ['razorpayConfig', hospitalId],
    queryFn: () => api.get('/api/razorpay/config').then((res) => res.data),
    enabled: !!hospitalId,
  });
  const isRazorpayActive = razorpayRes?.config?.enabled || false;

  const createTokenMutation = useCreateToken();
  const createPaymentMutation = useCreatePaymentOrder();
  const verifyPaymentMutation = useVerifyOnlinePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return alert('Please select a doctor');

    setLoading(true);
    try {
      const patientData = {
        name: patientName,
        phone: patientPhone,
        age: parseInt(patientAge),
        gender: patientGender,
      };

      if (paymentMethod === 'CASH') {
        // Direct cash token creation
        await createTokenMutation.mutateAsync({
          departmentId,
          doctorId,
          appointmentDate: appointmentDate,
          paymentType: 'CASH',
          patientDetails: patientData,
          isEmergency,
        });
        router.push('/admin/token');
      } else {
        // UPI/Online Payment Flow
        // 1. Create the payment order first
        const orderRes: any = await createPaymentMutation.mutateAsync({
          amount: selectedDoctor?.consultationFee || 500,
          method: paymentMethod,
          tokenId: 'PENDING',
          doctorId,
          departmentId,
          patientDetails: {
            ...patientData,
            appointmentDate // Include date for webhook token creation
          }
        });

        if (!orderRes.success && orderRes.message) {
          throw new Error(orderRes.message);
        }

        const orderData = orderRes.data || orderRes;

        // 2. Open Razorpay Checkout
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Hospital Token",
          description: `Consultation with Dr. ${selectedDoctor?.name}`,
          order_id: orderData.orderId,
          handler: async (response: any) => {
            try {
              setLoading(true);
              await verifyPaymentMutation.mutateAsync({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              router.push('/admin/token');
            } catch (err) {
              alert('Payment verification failed. Please check with admin.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: patientName,
            contact: typeof patientPhone === 'string' ? patientPhone : patientPhone.full,
          },
          theme: { color: "#2563eb" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc: any) =>
    doc.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* LEFT SIDE: FORM FILLING */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <User className="text-primary" /> Patient Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Phone Number
                </label>
                {/* <PhoneInput
                  country={'in'}
                  value={patientPhone.full}
                  onChange={(v) => setPatientPhone({ full: v })}
                  inputClass="!w-full !h-14 !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-2xl !font-bold"
                /> */}

                <PhoneNumberInput
                  value={patientPhone.full} // ✅ string for UI
                  onChange={(val) => setPatientPhone(val)} // ✅ full object
                  showLabel={false} // ✅ hide internal label since we have our own

                />


              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Patient Name
                </label>
                <input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 ring-primary/20"
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Age
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Gender
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Appointment Date
                </label>
                <input
                  required
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setpaymentMethod('CASH')}
                    className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'CASH' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                  >
                    <Banknote className="w-5 h-5 mb-1" />
                    <span className="text-xs font-bold">CASH</span>
                  </button>
                    {isRazorpayActive && (
                      <button
                        type="button"
                        onClick={() => setpaymentMethod('UPI')}
                        className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'UPI' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                      >
                        <Smartphone className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">UPI</span>
                      </button>
                    )}
                  <button
                    type="button"
                    onClick={() => setpaymentMethod('CARD')}
                    className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'CARD' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                  >
                    <CreditCard className="w-5 h-5 mb-1" />
                    <span className="text-xs font-bold">CARD</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Stethoscope className="text-primary" /> Select Specialization
            </h2>

            <div className="space-y-6">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full h-14 px-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-primary"
              >
                <option value="">Select Department</option>
                {departments.map((d: any) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {departmentId && (
                <input
                  type="text"
                  placeholder="Search doctor by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold"
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredDoctors.map((doc: any) => {
                  const today = new Date().toLocaleString('en-US', { weekday: 'long' });

                  const todayAvailability = doc.availability.find(
                    (a: any) => a.day === today,
                  );

                  return (
                    <div
                      key={doc._id}
                      onClick={() => setDoctorId(doc._id)}
                      className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all shadow-sm ${doctorId === doc._id
                          ? 'border-primary bg-primary/5 shadow-xl'
                          : 'border-slate-200 bg-white hover:shadow-md'
                        }`}
                    >
                      {/* TOP SECTION */}
                      <div className="flex gap-4 items-start">
                        {/* BIG PROFILE */}
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shadow">
                          {doc.userId?.profilePic ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${doc.userId.profilePic}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* INFO */}
                        <div className="flex-1">
                          <h3 className="font-extrabold text-lg">{doc.name}</h3>

                          <p className="text-xs text-slate-500 font-semibold uppercase">
                            {doc.departmentId?.name}
                          </p>

                          <p className="text-sm mt-1 font-bold text-primary">
                            ₹{doc.consultationFee}
                            <span className="text-slate-400 font-medium ml-2">
                              • {doc.experience} yrs exp
                            </span>
                          </p>

                          {/* STATUS */}
                          <div className="mt-2">
                            {doc.isAvailable && todayAvailability ? (
                              <span className="text-green-600 text-xs font-bold">
                                ● Available Today
                              </span>
                            ) : (
                              <span className="text-red-500 text-xs font-bold">
                                ● Not Available Today
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* AVAILABILITY SECTION */}
                      <div className="mt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
                          Weekly Schedule
                        </h4>

                        <div className="space-y-2">
                          {doc.availability.map((day: any) => (
                            <div
                              key={day._id}
                              className={`p-2 rounded-xl text-xs ${day.day === today
                                  ? 'bg-primary/10 border border-primary/30'
                                  : 'bg-slate-50'
                                }`}
                            >
                              <div className="flex justify-between font-bold">
                                <span>{day.day}</span>
                              </div>

                              {day.sessions.map((s: any) => (
                                <div key={s._id} className="text-slate-600 ml-1 mt-1">
                                  {s.label} : {s.from} - {s.to}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SELECT ICON */}
                      {doctorId === doc._id && (
                        <div className="mt-3 flex justify-end">
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEmergency(!isEmergency)}
            className={`w-full p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all ${isEmergency ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 bg-white text-slate-400'}`}
          >
            <Zap className={isEmergency ? 'animate-bounce' : ''} />
            <div className="text-left">
              <p className="text-xs font-black uppercase">Emergency Priority</p>
              <p className="text-[10px] font-bold">
                Instantly move to the front of the queue
              </p>
            </div>
          </button>
        </div>

        {/* RIGHT SIDE: LIVE TOKEN RECEIPT */}
        {/* RIGHT SIDE: LIVE TOKEN RECEIPT */}
        <div className="lg:col-span-5">
          <div className="sticky top-10 space-y-6">
            <div className="bg-primary rounded-[3rem] p-8 text-white shadow-2xl shadow-primary/40 relative overflow-hidden">
              {/* Decorative Branding */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

              <div className="relative z-10 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <Ticket className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">
                      Hospital Token
                    </p>
                    <p className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full inline-block mt-1">
                      Draft Preview
                    </p>
                  </div>
                </div>

                {/* MAIN PATIENT SECTION */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">
                      Patient Name
                    </p>
                    <h3 className="text-3xl text-white tracking-tighter italic ">
                      {patientName || '— — —'}
                    </h3>
                  </div>

                  {/* New Age & Gender Badge Row */}
                  <div className="flex gap-3">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex flex-col">
                      <span className="text-[9px] font-black uppercase opacity-60">
                        Age
                      </span>
                      <span className="text-sm font-bold">
                        {patientAge ? `${patientAge} Yrs` : '—'}
                      </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex flex-col">
                      <span className="text-[9px] font-black uppercase opacity-60">
                        Gender
                      </span>
                      <span className="text-sm font-bold">{patientGender || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-80">
                    <Smartphone className="w-4 h-4" />
                    <p className="text-sm font-bold">
                      {patientPhone.full || '+91 00000 00000'}
                    </p>
                  </div>
                </div>

                {/* DOCTOR & FEE SECTION */}
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-60">
                      Consulting
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate">
                        {selectedDoctor?.name || 'Select Doctor'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-60">
                      Consultation Fee
                    </p>
                    <p className="text-xl font-black text-yellow-300 italic">
                      ₹{selectedDoctor?.consultationFee || '0.00'}
                    </p>
                  </div>
                </div>

                {/* PAYMENT & STATUS */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      {paymentMethod === 'CASH' ? (
                        <Banknote className="w-5 h-5" />
                      ) : (
                        <Smartphone className="w-5 h-5" />
                      )}
                      <span className="text-xs font-black uppercase tracking-widest">
                        {paymentMethod} PAYMENT
                      </span>
                    </div>
                    {isEmergency && (
                      <span className="bg-red-500 text-[10px] px-3 py-1 rounded-full font-black animate-pulse flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-white" /> EMERGENCY
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !doctorId || !patientName}
                    className="w-full py-5 bg-white text-primary rounded-[2rem] font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      'Confirm & Generate Token'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tip / Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                Review all patient details before generating. Once confirmed, the token
                will be added to the queue immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
