'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetKioskFlow } from '@/store/slices/tokenSlice';

// Import Screens (to be created)
import HomeWelcome from '@/components/kiosk/HomeWelcome';
import SelectDepartment from '@/components/kiosk/SelectDepartment';
import SelectDoctor from '@/components/kiosk/SelectDoctor';
import PaymentMethod from '@/components/kiosk/PaymentMethod';
import TokenGenerated from '@/components/kiosk/TokenGenerated';
import CheckInDetails from '@/components/kiosk/checkInDetails/CheckInDetails';

type KioskStep = 'HOME' | 'CHECKIN' | 'DEPARTMENT' | 'DOCTOR' | 'PAYMENT' | 'TOKEN';

export default function KioskPage() {
  const [step, setStep] = useState<KioskStep>('HOME');
  const dispatch = useAppDispatch();
  const tokenData = useAppSelector((state) => state.token);

  // Auto-reset to home after inactivity on Token screen
  useEffect(() => {
    // if (step === 'TOKEN') {
    //   const timer = setTimeout(() => {
    //     handleReset();
    //   }, 30000); // 30 seconds
    //   return () => clearTimeout(timer);
    // }
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
