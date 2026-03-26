import { ApiValidationError, PaymentMethodType } from '@/modules/kiosk/api/kioskApis';
import useCreateToken from '@/modules/kiosk/hooks/useToken';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setGeneratedToken,
  setSelectedDepartment,
  setSelectedDoctor,
} from '@/store/slices/tokenSlice';
import { useState } from 'react';
import { batch } from 'react-redux';
export interface PaymentMethodProps {
  onNext: () => void;
  onBack: () => void;
  tokenNumber?: string;
  doctorName?: string;
  department?: string;
  fee?: string;
}

const usePaymentMethod = ({ onNext, onBack }: PaymentMethodProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const { mutateAsync, reset, isPending } = useCreateToken();
  const patientDetails = useAppSelector((state) => state.token.patientDetails);
  const dispatch = useAppDispatch();

  const handleContinue = async () => {
    if (!selectedMethod) return;
    if (!patientDetails) return;
    if (isPending) return;

    try {
      const { data } = await mutateAsync({
        patientDetails,
        paymentType: selectedMethod!,
        appointmentDate: new Date().toISOString().split('T')[0],
        departmentId: '69c37b4c15c6626dc6b6a5f5',
        doctorId: '69c37b7715c6626dc6b6a603',
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
  };
};

export default usePaymentMethod;
