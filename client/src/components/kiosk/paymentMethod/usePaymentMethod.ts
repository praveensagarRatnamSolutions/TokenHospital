import { useState } from 'react';

import { ApiValidationError, PaymentMethodType } from '@/modules/kiosk/api/kioskApis';
import useCreateToken from '@/modules/kiosk/hooks/useToken';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setGeneratedToken,
  setSelectedDepartment,
  setSelectedDoctor,
} from '@/store/slices/tokenSlice';
export interface PaymentMethodProps {
  onNext: () => void;
  onBack: () => void;
  tokenNumber?: string;
  doctorName?: string;
  department?: string;
  fee?: string;
}

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

const usePaymentMethod = ({ onNext, onBack }: PaymentMethodProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const { mutateAsync, reset, isPending } = useCreateToken();
  const patientDetails = useAppSelector((state) => state.token.patientDetails);
  const { user } = useAppSelector((state) => state.auth);
  const hospitalId = user?.hospitalId;
  const dispatch = useAppDispatch();

  // Check if Razorpay is enabled for this hospital
  const { data: razorpayStatus } = useQuery({
    queryKey: ['razorpayStatus', hospitalId],
    queryFn: () => api.get(`/api/razorpay/status?hospitalId=${hospitalId}`).then(res => res.data),
    enabled: !!hospitalId
  });

  const isRazorpayEnabled = razorpayStatus?.enabled || false;

  const handleContinue = async () => {
    if (!selectedMethod) return;
    if (!patientDetails) return;
    if (isPending) return;

    try {
      const { data } = await mutateAsync({
        patientDetails,
        paymentType: selectedMethod!,
        appointmentDate: new Date().toISOString().split('T')[0],
        departmentId: '69c517b7d905dfcda4bc53e4',
        doctorId: '69c51e36415678dd5119cc2e',
      });
      dispatch(setSelectedDepartment(data?.departmentId.name));
      dispatch(setSelectedDoctor(data?.doctorId.name));
      dispatch(setGeneratedToken(data?.tokenNumber));
      reset();
      onNext();
    } catch (error: unknown) {
      if ('errors' in (error as any)) {
        alert((error as ApiValidationError).errors[0].msg);
      }

      // General Error
      if ('message' in (error as any)) {
        alert((error as any).message);
      }
    }
  };

  const handleMethodSelect = (methodId: PaymentMethodType) => {
    setSelectedMethod(methodId);
  };

  const handleBack = () => {
    onBack();
  };

  return {
    handleContinue,
    handleMethodSelect,
    selectedMethod,
    handleBack,
    isPending,
    isRazorpayEnabled,
  };
};

export default usePaymentMethod;
