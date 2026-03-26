import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  patientSchema,
  TypeCheckInDetailsFormInput,
  TypeCheckInDetailsFormOutput,
} from '@/store/schema/patient.schema';
import { setPatientDetails } from '@/store/slices/tokenSlice';
export interface ICheckDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

const useCheckDetails = ({ onBack, onNext }: ICheckDetailsProps) => {
  const patientDetails = useAppSelector((state) => state.token.patientDetails);

  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    resetField,
    setFocus,
    formState: { errors },
  } = useForm<TypeCheckInDetailsFormInput, any, TypeCheckInDetailsFormOutput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      ...patientDetails,
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
        name: data.name,
        weight: data.weight.toString(),
        gender: data.gender,
        phone: data.phone,
      }),
    );
    onNext();
  };

  const handleClearPhone = () => {
    resetField('phone');
    setFocus('phone');
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
