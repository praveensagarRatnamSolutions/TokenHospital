import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { setPatientDetails } from '@/store/slices/tokenSlice';
import {
  patientSchema,
  TypeCheckInDetailsFormInput,
  TypeCheckInDetailsFormOutput,
} from '@/store/schema/patient.schema';
export interface ICheckDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

const useCheckDetails = ({ onBack, onNext }: ICheckDetailsProps) => {
  const { fullName, age, phoneNumber, weight } = useAppSelector(
    (state) => state.token.patientDetails,
  );

  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    resetField,
    setFocus,
    formState: { errors, isValid, isSubmitting },
  } = useForm<TypeCheckInDetailsFormInput, any, TypeCheckInDetailsFormOutput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName,
      age: age,
      phoneNumber: phoneNumber,
      weight: weight,
    },
    mode: 'onChange',
  });

  const handleBack = () => {
    // Handle back navigation
    onBack();
    console.log('Navigate back');
  };

  const handleConfirm = (data: TypeCheckInDetailsFormOutput) => {
    dispatch(
      setPatientDetails({
        age: data.age.toString(),
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        weight: data.weight.toString(),
      }),
    );
    onNext();
  };

  const handleClearPhone = () => {
    resetField('phoneNumber');
    setFocus('phoneNumber');
  };

  return {
    handleBack,
    handleConfirm,
    handleClearPhone,
    register,
    handleSubmit,
    errors,
  };
};

export default useCheckDetails;
