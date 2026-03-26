import { useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';
export interface TokenGeneratedProps {
  onFinish: () => void;
}
const useTokenGenerated = ({ onFinish }: TokenGeneratedProps) => {
  const [countdown, setCountdown] = useState(15);
  const {
    selectedDepartment,
    selectedDoctor,
    generatedToken,
    patientDetails: { name, age, phone, weight },
  } = useAppSelector((state) => state.token);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          //   onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onFinish]);

  const handlePrint = () => {
    // Implement print functionality
    console.log('Printing token...');
    window.print();
  };

  return {
    handlePrint,
    countdown,
    name,
    age,
    phone,
    weight,
    selectedDepartment,
    selectedDoctor,
    generatedToken,
  };
};

export default useTokenGenerated;
