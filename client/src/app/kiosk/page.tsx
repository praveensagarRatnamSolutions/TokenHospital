'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetKioskFlow } from '@/store/slices/tokenSlice';

// Import Screens (to be created)
import SelectDepartment from '@/components/kiosk/selectDepartment/SelectDepartment';
import SelectDoctor from '@/components/kiosk/selectDoctor/SelectDoctor';
import PaymentMethod from '@/components/kiosk/paymentMethod/PaymentMethod';
import TokenGenerated from '@/components/kiosk/tokenGenerated/TokenGenerated';
import CheckInDetails from '@/components/kiosk/checkInDetails/CheckInDetails';
import HomeWelcome from '@/components/kiosk/homeWelcome/HomeWelcome';

type KioskStep = 'HOME' | 'CHECKIN' | 'DEPARTMENT' | 'DOCTOR' | 'PAYMENT' | 'TOKEN';

export default function KioskPage() {
  const [step, setStep] = useState<KioskStep>('HOME');
  const dispatch = useAppDispatch();

  // Auto-reset to home after inactivity on Token screen
  useEffect(() => {
    if (step === 'TOKEN') {
      const timer = setTimeout(() => {
        handleReset();
      }, 30000); // 30 seconds
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleReset = () => {
    dispatch(resetKioskFlow());
    setStep('HOME');
  };

  const nextStep = (next: KioskStep) => {
    setStep(next);
  };

  const prevStep = () => {
    switch (step) {
      case 'DEPARTMENT':
        setStep('CHECKIN');
        break;
      case 'CHECKIN':
        setStep('HOME');
        break;
      case 'DOCTOR':
        setStep('DEPARTMENT');
        break;
      case 'PAYMENT':
        // setStep('DOCTOR');
        setStep('CHECKIN');
        break;
      default:
        setStep('HOME');
    }
  };

  return (
    <>
      {step === 'HOME' && <HomeWelcome onStart={() => nextStep('CHECKIN')} />}
      {step === 'CHECKIN' && (
        // <CheckInDetails onNext={() => nextStep('DEPARTMENT')} onBack={prevStep} />
        <CheckInDetails onNext={() => nextStep('PAYMENT')} onBack={prevStep} />
      )}
      {step === 'DEPARTMENT' && (
        <SelectDepartment onNext={() => nextStep('DOCTOR')} onBack={prevStep} />
      )}
      {step === 'DOCTOR' && (
        <SelectDoctor onNext={() => nextStep('PAYMENT')} onBack={prevStep} />
      )}
      {step === 'PAYMENT' && (
        <PaymentMethod onNext={() => nextStep('TOKEN')} onBack={prevStep} />
      )}
      {step === 'TOKEN' && <TokenGenerated onFinish={handleReset} />}
    </>
  );
}
