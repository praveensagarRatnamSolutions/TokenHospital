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
        phone: data.phone,
        weight: data.weight.toString(),
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
